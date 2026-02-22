/**
 * In-app history of actions (create, feed, hunt, victim). Stored per address in localStorage.
 */

export type HistoryEntryType = 'created' | 'fed' | 'hunted' | 'victim';

export interface HistoryEntry {
  type: HistoryEntryType;
  monsterName?: string;
  victimName?: string;
  killerName?: string;
  /** For victim: avoid duplicate entry per monster. */
  monsterId?: number;
  timestamp: number;
}

const STORAGE_PREFIX = 'monstro-history-';
const MAX_ENTRIES = 100;

function storageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

export function getHistory(address: string | undefined): HistoryEntry[] {
  if (!address || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return [];
    const list = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(
  address: string | undefined,
  entry: Omit<HistoryEntry, 'timestamp'>
): void {
  if (!address || typeof window === 'undefined') return;
  const list = getHistory(address);
  const newEntry: HistoryEntry = { ...entry, timestamp: Date.now() };
  const next = [newEntry, ...list].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(next));
  } catch {
    // ignore quota or parse errors
  }
}

/** Check if we already added a victim entry for this monster (to avoid duplicates). */
export function hasVictimEntryForMonster(address: string | undefined, monsterId: number): boolean {
  const list = getHistory(address);
  return list.some((e) => e.type === 'victim' && e.monsterId === monsterId);
}

export function addVictimEntry(
  address: string | undefined,
  killerName: string,
  monsterId?: number
): void {
  if (!address || typeof window === 'undefined') return;
  if (monsterId !== undefined && hasVictimEntryForMonster(address, monsterId)) return;
  const list = getHistory(address);
  const newEntry: HistoryEntry = { type: 'victim', killerName, timestamp: Date.now() };
  if (monsterId !== undefined) newEntry.monsterId = monsterId;
  const next = [newEntry, ...list].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(next));
  } catch {}
}
