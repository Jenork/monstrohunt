'use client';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';

export function useHuntMonster() {
  const { addToast } = useToast();
  const { isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  const huntMonster = async (monsterId: number) => {
    if (!isConnected) {
      addToast('Please connect your wallet', 'error');
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
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'huntMonster',
        args: [BigInt(monsterId)],
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Switch to Base Sepolia or try again';
      addToast(msg, 'error');
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
