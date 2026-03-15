'use client';

import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { usePlayerAddress } from './usePlayerAddress';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { MonsterInfo } from '../types/monster';
import { formatMonsterName } from '../utils/format';
import { getMonsterStatus } from '../utils/monster';
import { generateMockMonsters, isMockMode } from '../utils/mockData';

export function useMonsterInfo(
  monsterId: number | undefined,
  options?: { fetchCanHunt?: boolean }
) {
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();
  const fetchCanHunt = options?.fetchCanHunt !== false;
  
  const {
    data: monsterData,
    refetch,
    isLoading: isLoadingMonster,
    isError: isErrorMonster,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getMonster',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !mockMode && isContractAddressValid,
    },
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getPendingRewards',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !!monsterData && !mockMode && isContractAddressValid,
    },
  });

  const { data: feedCost } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getFeedCost',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !!monsterData && !mockMode && isContractAddressValid,
    },
  });

  const { data: canHunt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'canHunt',
    args: address && monsterId !== undefined ? [address as Address, BigInt(monsterId)] : undefined,
    query: {
      enabled:
        fetchCanHunt &&
        monsterId !== undefined &&
        !!monsterData &&
        !!address &&
        !mockMode &&
        isContractAddressValid,
    },
  });

  // Mock режим
  if (mockMode && monsterId !== undefined) {
    const mockMonsters = generateMockMonsters(10);
    const mockMonster = mockMonsters.find(m => m.id === monsterId);
    
    if (mockMonster) {
      // Обновляем canHunt для starved монстров
      const updatedMonster: MonsterInfo = {
        ...mockMonster,
        status: {
          ...mockMonster.status,
          canHunt: mockMonster.status.status === 'starved' && mockMonster.owner.toLowerCase() !== address?.toLowerCase(),
        },
      };
      
      return { 
        monster: updatedMonster, 
        refetch: () => Promise.resolve() 
      };
    }
    
    return { monster: null, refetch: () => Promise.resolve(), isLoading: false, isError: false };
  }

  if (isLoadingMonster) {
    return { monster: null, refetch, isLoading: true, isError: false };
  }

  if (!monsterData || isErrorMonster) {
    return { monster: null, refetch, isLoading: false, isError: isErrorMonster };
  }

  // Single source of truth: all fields from getMonster + getFeedCost. Owner is contract owner only (never name/bytes32).
  const [
    nameBytes,
    avatarId,
    tier,
    initialWeight,
    weight,
    hungerDeadline,
    alive,
    lastRewardIndex,
    lastHuntAttemptAt,
    owner,
  ] = monsterData as [
    string,
    number,
    number,
    bigint,
    bigint,
    bigint,
    boolean,
    bigint,
    bigint,
    Address,
  ];

  const monster: MonsterInfo = {
    id: monsterId!,
    name: formatMonsterName(nameBytes),
    avatarId: Number(avatarId),
    tier: tier as 0 | 1 | 2,
    initialWeight: BigInt(initialWeight),
    weight: BigInt(weight),
    hungerDeadline: BigInt(hungerDeadline),
    alive,
    lastRewardIndex: BigInt(lastRewardIndex),
    lastHuntAttemptAt: BigInt(lastHuntAttemptAt),
    owner: owner as Address,
    status: getMonsterStatus(
      {
        id: monsterId!,
        name: formatMonsterName(nameBytes),
        avatarId: Number(avatarId),
        tier: tier as 0 | 1 | 2,
        initialWeight: BigInt(initialWeight),
        weight: BigInt(weight),
        hungerDeadline: BigInt(hungerDeadline),
        alive,
        lastRewardIndex: BigInt(lastRewardIndex),
        lastHuntAttemptAt: BigInt(lastHuntAttemptAt),
          owner: owner as Address,
      },
      BigInt(Math.floor(Date.now() / 1000)),
      canHunt as boolean | undefined
    ),
    pendingRewards: BigInt(pendingRewards || 0),
    feedCost: BigInt(feedCost || 0),
  };

  return { monster, refetch, isLoading: false, isError: false };
}
