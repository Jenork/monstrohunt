'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { useToast } from './useToast';

export function useHuntMonster() {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const huntMonster = async (monsterId: number) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'huntMonster',
        args: [BigInt(monsterId)],
      });
    } catch (err: any) {
      addToast(err.message || 'Failed to hunt monster', 'error');
    }
  };

  return {
    huntMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
