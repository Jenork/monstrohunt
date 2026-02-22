import { describe, it, expect, beforeEach } from 'vitest';
import { getSellAmount, getMonsterStatus, getHuntCooldownRemaining } from './monster';
import type { Monster } from '../types/monster';

// SELL_FEE_BP = 100 (1%)
describe('getSellAmount', () => {
  it('deducts 1% from weight', () => {
    const weight = BigInt(10000);
    const received = getSellAmount(weight);
    expect(received).toBe(BigInt(9900));
  });

  it('returns 0 for 0 weight', () => {
    expect(getSellAmount(BigInt(0))).toBe(BigInt(0));
  });
});

describe('getMonsterStatus', () => {
  const baseMonster: Monster = {
    id: 1,
    name: 'Test',
    avatarId: 0,
    tier: 0,
    initialWeight: BigInt(1000000000000000),
    weight: BigInt(1000000000000000),
    hungerDeadline: BigInt(0),
    alive: true,
    lastRewardIndex: BigInt(0),
    lastHuntAttemptAt: BigInt(0),
    owner: '0x1234567890123456789012345678901234567890',
  };

  it('returns starved when !alive', () => {
    const m = { ...baseMonster, alive: false };
    const status = getMonsterStatus(m, BigInt(1000));
    expect(status.status).toBe('starved');
    expect(status.timeToStarve).toBe(BigInt(0));
  });

  it('returns starved when hungerDeadline <= currentTime', () => {
    const now = BigInt(1000);
    const m = { ...baseMonster, hungerDeadline: now, alive: true };
    const status = getMonsterStatus(m, now);
    expect(status.status).toBe('starved');
  });

  it('returns calm when >50% time remaining', () => {
    const hungerWindow = 7 * 24 * 3600;
    const now = BigInt(0);
    const deadline = BigInt(Math.floor(hungerWindow * 0.8)); // 80% of window left
    const m = { ...baseMonster, hungerDeadline: deadline };
    const status = getMonsterStatus(m, now);
    expect(status.status).toBe('calm');
    expect(status.timeToStarve).toBe(deadline);
  });

  it('returns hungry when 25-50% time remaining', () => {
    const hungerWindow = 7 * 24 * 3600;
    const now = BigInt(0);
    const deadline = BigInt(Math.floor(hungerWindow * 0.4)); // 40% left
    const m = { ...baseMonster, hungerDeadline: deadline };
    const status = getMonsterStatus(m, now);
    expect(status.status).toBe('hungry');
  });

  it('returns critical when <25% time remaining', () => {
    const hungerWindow = 7 * 24 * 3600;
    const now = BigInt(0);
    const deadline = BigInt(Math.floor(hungerWindow * 0.2)); // 20% of window left
    const m = { ...baseMonster, hungerDeadline: deadline };
    const status = getMonsterStatus(m, now);
    expect(status.status).toBe('critical');
  });
});

describe('getHuntCooldownRemaining', () => {
  const HUNT_COOLDOWN = 20 * 60;

  it('returns 0 when cooldown ended', () => {
    const lastAttempt = BigInt(0);
    const now = BigInt(HUNT_COOLDOWN + 1);
    expect(getHuntCooldownRemaining(lastAttempt, now)).toBe(BigInt(0));
  });

  it('returns remaining time when in cooldown', () => {
    const lastAttempt = BigInt(100);
    const now = BigInt(200);
    const remaining = getHuntCooldownRemaining(lastAttempt, now);
    expect(remaining).toBe(BigInt(HUNT_COOLDOWN - 100));
  });
});
