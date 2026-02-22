import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getHistory,
  addHistoryEntry,
  hasVictimEntryForMonster,
  addVictimEntry,
  type HistoryEntry,
} from './historyStore';

const ADDR = '0x1234567890123456789012345678901234567890';

describe('historyStore', () => {
  beforeEach(() => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      (globalThis as any).localStorage.clear();
    }
  });

  afterEach(() => {
    (globalThis as any).localStorage?.clear?.();
  });

  it('getHistory returns [] for undefined address', () => {
    expect(getHistory(undefined)).toEqual([]);
  });

  it('addHistoryEntry and getHistory roundtrip', () => {
    addHistoryEntry(ADDR, { type: 'created', monsterName: 'Foo' });
    const list = getHistory(ADDR);
    expect(list).toHaveLength(1);
    expect(list[0].type).toBe('created');
    expect(list[0].monsterName).toBe('Foo');
    expect(list[0].timestamp).toBeDefined();
  });

  it('addHistoryEntry does nothing for undefined address', () => {
    addHistoryEntry(undefined, { type: 'fed' });
    expect(getHistory(ADDR)).toEqual([]);
  });

  it('hasVictimEntryForMonster returns false when no victim entry', () => {
    addHistoryEntry(ADDR, { type: 'created' });
    expect(hasVictimEntryForMonster(ADDR, 1)).toBe(false);
  });

  it('addVictimEntry and hasVictimEntryForMonster', () => {
    addVictimEntry(ADDR, '0xabc...', 1);
    expect(hasVictimEntryForMonster(ADDR, 1)).toBe(true);
    const list = getHistory(ADDR);
    expect(list[0].type).toBe('victim');
    expect(list[0].killerName).toBe('0xabc...');
    expect((list[0] as HistoryEntry & { monsterId?: number }).monsterId).toBe(1);
  });

  it('addVictimEntry does not duplicate for same monsterId', () => {
    addVictimEntry(ADDR, 'Killer1', 1);
    addVictimEntry(ADDR, 'Killer2', 1);
    const list = getHistory(ADDR);
    const victims = list.filter((e) => e.type === 'victim');
    expect(victims).toHaveLength(1);
    expect(victims[0].killerName).toBe('Killer1');
  });
});
