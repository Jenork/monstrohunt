'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { TIER_PRICES } from '../constants/game';
import type { Tier } from '../constants/game';
import { useToast } from './useToast';

export function useCreateMonster() {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMonster = async (
    name: string,
    avatarId: number,
    tier: Tier
  ) => {
    try {
      const tierPrice = TIER_PRICES[tier];
      if (!tierPrice) {
        addToast('Invalid tier selected', 'error');
        return;
      }

      // Convert string to bytes32 (pad to 32 bytes, then convert to hex)
      const encoder = new TextEncoder();
      const nameBytes = encoder.encode(name.slice(0, 32));
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(nameBytes);
      const hexString = Array.from(paddedBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const nameBytes32 = `0x${hexString}` as `0x${string}`;
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'createMonster',
        args: [nameBytes32, avatarId, tier],
        value: tierPrice,
      });
    } catch (err: any) {
      addToast(err.message || 'Failed to create monster', 'error');
    }
  };

  return {
    createMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
