'use client';

import { useReadContract } from 'wagmi';
import { usePlayerAddress } from './usePlayerAddress';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { isMockMode } from '../utils/mockData';

export function useMyMonsters() {
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();
  
  const { data: monsterId, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !mockMode,
    },
  });

  // Mock режим - показываем монстра для демонстрации
  if (mockMode && address) {
    // В mock режиме показываем монстра с ID 1 как "ваш"
    return { monsterIds: [1], refetch: () => Promise.resolve() };
  }

  // Return array format for compatibility, but only one monster per wallet
  const monsterIds = monsterId && monsterId > 0n ? [monsterId] : [];
  
  return { monsterIds: monsterIds.map(id => Number(id)), refetch };
}
