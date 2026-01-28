export type Tier = 0 | 1 | 2; // Scout, Hunter, Leviathan

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
  owner: string;
}

export interface MonsterStatus {
  status: 'fed' | 'hungry' | 'starved';
  timeToStarve: bigint;
  timeToHunt?: bigint;
  canHunt?: boolean;
}

export interface MonsterInfo extends Monster {
  status: MonsterStatus;
  pendingRewards: bigint;
  feedCost: bigint;
}
