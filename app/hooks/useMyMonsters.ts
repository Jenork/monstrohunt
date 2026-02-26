'use client';

import { useReadContract } from 'wagmi';
import { usePlayerAddress } from './usePlayerAddress';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { isMockMode } from '../utils/mockData';

export function useMyMonsters() {
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  const { data: monsterId, refetch: refetchId, isLoading: isLoadingId, isError: isErrorId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !mockMode && isContractAddressValid,
    },
  });

  const rawId = monsterId !== undefined && monsterId > 0n ? monsterId : undefined;

  const { data: monsterData, refetch: refetchMonster, isLoading: isLoadingMonster } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getMonster',
    args: rawId !== undefined ? [rawId] : undefined,
    query: {
      enabled: !!address && !mockMode && isContractAddressValid && rawId !== undefined,
    },
  });

  const refetch = () => {
    refetchId();
    refetchMonster();
  };

  // Mock режим - показываем монстра для демонстрации
  if (mockMode && address) {
    return { monsterIds: [1], refetch: () => Promise.resolve(), isLoading: false, isError: false };
  }

  // Only show monster in Manage if it exists and is alive (dead = slot free for new monster)
  const alive =
    monsterData &&
    typeof monsterData[6] === 'boolean' &&
    monsterData[6] === true;
  const monsterIds = rawId !== undefined && alive ? [rawId] : [];
  const loading =
    !!address && !mockMode && isContractAddressValid && (isLoadingId || (rawId !== undefined && isLoadingMonster));

  return {
    monsterIds: monsterIds.map((id) => Number(id)),
    refetch,
    isLoading: loading,
    isError: !!address && !mockMode && isContractAddressValid && isErrorId,
  };
}
