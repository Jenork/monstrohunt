'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useConnect,
  useWalletClient,
  usePublicClient,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { encodeFunctionData } from 'viem';
import { eip5792Actions } from 'viem/experimental';
import type { Address } from 'viem';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { getErrorMessage } from '../utils/error';
import { TIER_PRICES } from '../constants/game';
import type { Tier } from '../constants/game';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';

export function useCreateMonster() {
  const { addToast } = useToast();
  const { isConnected, address } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: base.id });
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  // After tx confirmation: invalidate contract reads so UI refetches from chain (owner, weight, feedCost, sell amount, status).
  useEffect(() => {
    if (!isSuccess) return;
    queryClient.invalidateQueries({ queryKey: ['readContract'] });
  }, [isSuccess, queryClient]);

  const createMonster = (
    name: string,
    avatarId: number,
    tier: Tier
  ) => {
    if (!isConnected) {
      const connector = connectors[0];
      if (!connector) {
        addToast('No wallet connector available', 'error');
        return;
      }
      addToast('Connecting wallet...', 'info');
      connectAsync({ connector }).catch((e) => {
        addToast(getErrorMessage(e, 'Wallet connection failed'), 'error');
      });
      return;
    }
    if (!isContractAddressValid) {
      addToast('Contract address is not configured', 'error');
      return;
    }
    const tierPrice = TIER_PRICES[tier];
    if (!tierPrice) {
      addToast('Invalid tier selected', 'error');
      return;
    }

    // Contract: name max 31 bytes. Encode and take first 31 bytes, then pad to 32.
    const encoder = new TextEncoder();
    const encoded = encoder.encode(name.trim());
    const nameBytes = new Uint8Array(32);
    const copyLen = Math.min(31, encoded.length);
    nameBytes.set(encoded.subarray(0, copyLen));
    const hexString = Array.from(nameBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const nameBytes32 = `0x${hexString}` as `0x${string}`;

    if (nameBytes32 === '0x' + '00'.repeat(32)) {
      addToast('Name required', 'error');
      return;
    }
    (async () => {
      setIsCreating(true);
      const data = encodeFunctionData({
        abi: monstroHuntABI,
        functionName: 'createMonster',
        args: [nameBytes32, avatarId, tier],
      });

      try {
        if (chainId !== base.id) {
          await switchChainAsync({ chainId: base.id });
        }

        // 1) Base App / smart wallets: EIP-5792 wallet_sendCalls
        if (walletClient && address) {
          try {
            const eip5792 = walletClient.extend(eip5792Actions());
            const caps = await eip5792.getCapabilities({ account: address as Address });
            if (caps?.wallet_sendCalls) {
              await eip5792.sendCalls({
                account: address as Address,
                chain: base,
                calls: [{ to: CONTRACT_ADDRESS, data, value: tierPrice }],
                experimental_fallback: true,
              });
              queryClient.invalidateQueries({ queryKey: ['readContract'] });
              addToast('Monster created successfully!', 'success');
              return;
            }
          } catch (sendCallsErr: unknown) {
            if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
              console.warn('[useCreateMonster] sendCalls failed', sendCallsErr);
            }
          }
        }

        // 2) Prepared tx: RPC builds the tx (gas, nonce), wallet only signs
        if (publicClient && walletClient && address) {
          try {
            const request = await walletClient.prepareTransactionRequest({
              account: address as Address,
              to: CONTRACT_ADDRESS,
              data,
              value: tierPrice,
              chain: base,
            });
            const txHash = await walletClient.sendTransaction(request);
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            queryClient.invalidateQueries({ queryKey: ['readContract'] });
            addToast('Monster created successfully!', 'success');
            return;
          } catch (preparedErr: unknown) {
            if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
              console.warn('[useCreateMonster] prepared sendTransaction failed', preparedErr);
            }
          }
        }

        // 3) Fallback: writeContract (no gas override — let wallet/RPC estimate for Base App)
        await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: monstroHuntABI,
          functionName: 'createMonster',
          args: [nameBytes32, avatarId, tier],
          value: tierPrice,
          chainId: base.id,
        });
      } catch (e: unknown) {
        const msg = getErrorMessage(e, 'Transaction was cancelled or failed');
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && e) {
          console.warn('[useCreateMonster] error', e);
        }
        addToast(msg, 'error');
      } finally {
        setIsCreating(false);
      }
    })();
  };

  return {
    createMonster,
    isPending: isCreating || isSwitchingChain || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
