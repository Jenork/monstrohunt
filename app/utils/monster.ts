import { Monster, MonsterStatus } from '../types/monster';
import { HUNGER_WINDOW, HUNT_COOLDOWN, SELL_FEE_BP } from '../constants/game';

/** Amount received after 1% protocol fee. */
export function getSellAmount(weight: bigint): bigint {
  return weight - (weight * BigInt(SELL_FEE_BP) / BigInt(10000));
}

export function getMonsterStatus(
  monster: Monster,
  currentTime: bigint,
  canHunt?: boolean
): MonsterStatus {
  if (!monster.alive) {
    return {
      status: 'starved',
      timeToStarve: BigInt(0),
    };
  }
  
  const timeUntilDeadline = monster.hungerDeadline > currentTime
    ? monster.hungerDeadline - currentTime
    : BigInt(0);
  
  // STARVED: deadline passed - can be hunted
  if (monster.hungerDeadline <= currentTime) {
    return {
      status: 'starved',
      timeToStarve: BigInt(0),
      canHunt: canHunt ?? false,
    };
  }
  
  const hungerTime = BigInt(HUNGER_WINDOW);
  const percentRemaining = (timeUntilDeadline * BigInt(100)) / hungerTime;
  
  // CRITICAL: <25% time remaining (last quarter of hunger period)
  if (percentRemaining < BigInt(25)) {
    return {
      status: 'critical',
      timeToStarve: timeUntilDeadline,
      canHunt: false,
    };
  }
  
  // HUNGRY: 25-50% time remaining
  if (percentRemaining < BigInt(50)) {
    return {
      status: 'hungry',
      timeToStarve: timeUntilDeadline,
      canHunt: false,
    };
  }
  
  // CALM: >50% time remaining
  return {
    status: 'calm',
    timeToStarve: timeUntilDeadline,
  };
}

export function getHuntCooldownRemaining(
  lastHuntAttemptAt: bigint,
  currentTime: bigint
): bigint {
  const cooldownEnd = lastHuntAttemptAt + BigInt(HUNT_COOLDOWN);
  if (cooldownEnd <= currentTime) {
    return BigInt(0);
  }
  return cooldownEnd - currentTime;
}
