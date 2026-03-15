import type { Tier } from '../constants/game';
import type { Address } from 'viem';

export type { Tier };

export interface Monster {
  id: number;
  name: string;
  avatarId: number;
  tier: Tier;
  initialWeight: bigint;
  weight: bigint;
  hungerDeadline: bigint;
  alive: boolean;
  lastRewardIndex: bigint;
  lastHuntAttemptAt: bigint;
  owner: Address;
}

export interface MonsterStatus {
  status: 'calm' | 'hungry' | 'critical' | 'starved';
  timeToStarve: bigint;
  canHunt?: boolean;
}

export interface MonsterInfo extends Monster {
  status: MonsterStatus;
  pendingRewards: bigint;
  feedCost: bigint;
}
