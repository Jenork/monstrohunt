import { Monster, MonsterStatus } from '../types/monster';
import { HUNGER_WINDOW, HUNT_COOLDOWN } from '../constants/game';

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
  
  if (monster.hungerDeadline <= currentTime) {
    return {
      status: 'starved',
      timeToStarve: BigInt(0),
      canHunt: canHunt ?? false,
    };
  }
  
  // Check if hungry (within 7 days but close to deadline)
  const hungerTime = BigInt(HUNGER_WINDOW);
  const timeSinceDeadlineSet = hungerTime - timeUntilDeadline;
  
  if (timeSinceDeadlineSet >= hungerTime * BigInt(6) / BigInt(7)) {
    // Last day before starvation
    return {
      status: 'hungry',
      timeToStarve: timeUntilDeadline,
      canHunt: false,
    };
  }
  
  return {
    status: 'fed',
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
