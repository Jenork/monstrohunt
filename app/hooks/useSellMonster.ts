'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useSellMonster() {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sellMonster = async (monsterId: number) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'sellMonster',
        args: [BigInt(monsterId)],
      });
    } catch (err: any) {
      addToast(err.message || 'Failed to sell monster', 'error');
    }
  };

  return {
    sellMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
