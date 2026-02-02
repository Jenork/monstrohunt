'use client';

import { useEffect } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useConnect,
} from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';

export function useSellMonster() {
  const { addToast } = useToast();
  const { isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  const sellMonster = async (monsterId: number) => {
    if (!isConnected) {
      const connector =
        connectors.find((c) => c.type === 'walletConnect') ?? connectors[0];
      if (!connector) {
        addToast('No wallet connector available', 'error');
        return;
      }
      addToast('Connecting wallet...', 'info');
      connectAsync({ connector }).catch((e) => {
        const msg = e instanceof Error ? e.message : 'Wallet connection failed';
        addToast(msg, 'error');
      });
      return;
    }
    if (!isContractAddressValid) {
      addToast('Contract address is not configured', 'error');
      return;
    }
    if (monsterId <= 0) {
      addToast('Invalid monster', 'error');
      return;
    }
    try {
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'sellMonster',
        args: [BigInt(monsterId)],
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Switch to Base Sepolia or try again';
      addToast(msg, 'error');
    }
  };

  return {
    sellMonster,
    isPending: isSwitchingChain || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
