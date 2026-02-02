'use client';

import { useReadContract } from 'wagmi';
import { usePlayerAddress } from './usePlayerAddress';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { isMockMode } from '../utils/mockData';

export function useMyMonsters() {
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();
  
  const { data: monsterId, refetch, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !mockMode && isContractAddressValid,
    },
  });

  // Mock режим - показываем монстра для демонстрации
  if (mockMode && address) {
    return { monsterIds: [1], refetch: () => Promise.resolve(), isLoading: false, isError: false };
  }

  const monsterIds = monsterId !== undefined && monsterId > 0n ? [monsterId] : [];
  const loading = !!address && !mockMode && isContractAddressValid && isLoading;

  return {
    monsterIds: monsterIds.map((id) => Number(id)),
    refetch,
    isLoading: loading,
    isError: !!address && !mockMode && isContractAddressValid && isError,
  };
}
