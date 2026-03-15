'use client';

import { useEffect } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useConnect,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { getErrorMessage } from '../utils/error';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';

export function useHuntMonster() {
  const { addToast } = useToast();
  const { isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isPending: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  const huntMonster = async (monsterId: number) => {
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
    if (monsterId <= 0) {
      addToast('Invalid target', 'error');
      return;
    }
    try {
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'huntMonster',
        args: [BigInt(monsterId)],
        chainId: base.id,
      });
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Switch to Base or try again'), 'error');
    }
  };

  return {
    huntMonster,
    isPending: isSwitchingChain || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
