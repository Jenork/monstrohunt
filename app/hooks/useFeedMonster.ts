'use client';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useFeedMonster() {
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

  const feedMonster = (monsterId: number, feedCost: bigint) => {
    if (monsterId <= 0) {
      addToast('Invalid monster', 'error');
      return;
    }
    if (feedCost <= 0n) {
      addToast('Invalid feed cost', 'error');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      functionName: 'feedMonster',
      args: [BigInt(monsterId)],
      value: feedCost,
    });
  };

  return {
    feedMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
