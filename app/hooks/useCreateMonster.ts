'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { TIER_PRICES } from '../constants/game';
import type { Tier } from '../constants/game';
import { useToast } from './useToast';

export function useCreateMonster() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  // After tx confirmation: invalidate contract reads so UI refetches from chain (owner, weight, feedCost, sell amount, status).
  useEffect(() => {
    if (!isSuccess) return;
    queryClient.invalidateQueries({ queryKey: ['readContract'] });
  }, [isSuccess, queryClient]);

  const createMonster = (
    name: string,
    avatarId: number,
    tier: Tier
  ) => {
    if (!isContractAddressValid) {
      addToast('Contract address is not configured', 'error');
      return;
    }
    const tierPrice = TIER_PRICES[tier];
    if (!tierPrice) {
      addToast('Invalid tier selected', 'error');
      return;
    }

    // Contract: name max 31 bytes. Encode and take first 31 bytes, then pad to 32.
    const encoder = new TextEncoder();
    const encoded = encoder.encode(name.trim());
    const nameBytes = new Uint8Array(32);
    const copyLen = Math.min(31, encoded.length);
    nameBytes.set(encoded.subarray(0, copyLen));
    const hexString = Array.from(nameBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const nameBytes32 = `0x${hexString}` as `0x${string}`;

    if (nameBytes32 === '0x' + '00'.repeat(32)) {
      addToast('Name required', 'error');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      functionName: 'createMonster',
      args: [nameBytes32, avatarId, tier],
      value: tierPrice,
    });
  };

  return {
    createMonster,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
