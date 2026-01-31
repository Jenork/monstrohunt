'use client';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useSellMonster() {
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

  const sellMonster = (monsterId: number) => {
    if (monsterId <= 0) {
      addToast('Invalid monster', 'error');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      functionName: 'sellMonster',
      args: [BigInt(monsterId)],
    });
  };

  return {
    sellMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
