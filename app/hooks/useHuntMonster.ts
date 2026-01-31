'use client';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useHuntMonster() {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  const huntMonster = (monsterId: number) => {
    if (monsterId <= 0) {
      addToast('Invalid target', 'error');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      functionName: 'huntMonster',
      args: [BigInt(monsterId)],
    });
  };

  return {
    huntMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
