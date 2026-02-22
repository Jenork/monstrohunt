'use client';

import { MonsterStatus } from '../../types/monster';
import { STATUS_COLORS, HUNGER_WINDOW } from '../../constants/game';
import styles from './StatusDisplay.module.css';

interface StatusDisplayProps {
  status: MonsterStatus;
  /** Hide hint text (e.g. "Feed soon", "Well fed") - used in Hunt cards */
  hideHint?: boolean;
  /** Narrower width (70%) - used in Hunt cards */
  compact?: boolean;
}

export function StatusDisplay({ status, hideHint = false, compact = false }: StatusDisplayProps) {
  const color = STATUS_COLORS[status.status];
  const totalTime = HUNGER_WINDOW;
  const remaining = Number(status.timeToStarve);
  const progress = Math.max(0, Math.min(100, (remaining / totalTime) * 100));
  
  const labels: Record<string, { label: string; hint: string }> = {
    calm: { label: 'Calm', hint: 'Well fed' },
    hungry: { label: 'Hungry', hint: 'Feed soon' },
    critical: { label: 'Critical', hint: 'Feed now!' },
    starved: { label: 'Starved', hint: 'Can be hunted' },
  };
  
  const { label, hint } = labels[status.status] || labels.starved;

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      <div className={styles.statusRow}>
        <div className={styles.status} style={{ backgroundColor: color }}>
          {label}
        </div>
        {!hideHint && <div className={styles.time}>{hint}</div>}
      </div>
      {status.status !== 'starved' && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: `${progress}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}
