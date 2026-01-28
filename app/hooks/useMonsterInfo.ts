'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { MonsterInfo } from '../types/monster';
import { formatMonsterName } from '../utils/format';
import { getMonsterStatus } from '../utils/monster';

export function useMonsterInfo(monsterId: number | undefined) {
  const { address } = useAccount();
  
  const { data: monsterData, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getMonster',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined,
    },
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getPendingRewards',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !!monsterData,
    },
  });

  const { data: feedCost } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getFeedCost',
    args: monsterId !== undefined ? [BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !!monsterData,
    },
  });

  const { data: canHunt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'canHunt',
    args: address && monsterId !== undefined ? [address, BigInt(monsterId)] : undefined,
    query: {
      enabled: monsterId !== undefined && !!monsterData && !!address,
    },
  });

  if (!monsterData) {
    return { monster: null, refetch };
  }

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
    string,
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
    owner,
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
        owner,
      },
      BigInt(Math.floor(Date.now() / 1000)),
      canHunt as boolean | undefined
    ),
    pendingRewards: BigInt(pendingRewards || 0),
    feedCost: BigInt(feedCost || 0),
  };

  return { monster, refetch };
}
