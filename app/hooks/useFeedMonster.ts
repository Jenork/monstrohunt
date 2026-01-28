'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useFeedMonster() {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const feedMonster = async (monsterId: number, feedCost: bigint) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'feedMonster',
        args: [BigInt(monsterId)],
        value: feedCost,
      });
    } catch (err: any) {
      addToast(err.message || 'Failed to feed monster', 'error');
    }
  };

  return {
    feedMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
