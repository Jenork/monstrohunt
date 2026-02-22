'use client';

import { useState, useRef, useEffect } from 'react';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { getHistory, type HistoryEntry } from '../../utils/historyStore';
import styles from './HistoryButton.module.css';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function entryLabel(e: HistoryEntry): string {
  switch (e.type) {
    case 'created':
      return `Создание монстра${e.monsterName ? `: ${e.monsterName}` : ''}`;
    case 'fed':
      return 'Кормление монстра';
    case 'hunted':
      return `Успешная охота${e.victimName ? `: ${e.victimName}` : ''}`;
    case 'victim':
      return `Ты стал жертвой${e.killerName ? ` (${e.killerName})` : ''}`;
    default:
      return '';
  }
}

export function HistoryButton() {
  const { address } = usePlayerAddress();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries(getHistory(address));
  }, [address, open]); // refetch when opening so we have latest

  useEffect(() => {
    if (!open) return;
    const handle = (ev: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={popRef}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-label="История действий"
        aria-expanded={open}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </button>
      {open && (
        <div className={styles.popover}>
          <div className={styles.popoverTitle}>История</div>
          <ul className={styles.list}>
            {entries.length === 0 ? (
              <li className={styles.empty}>Пока нет записей</li>
            ) : (
              entries.map((e, i) => (
                <li key={`${e.timestamp}-${i}`} className={styles.item}>
                  <span className={styles.itemLabel}>{entryLabel(e)}</span>
                  <span className={styles.itemTime}>{formatTime(e.timestamp)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
