'use client';

import { MonsterStatus } from '../../types/monster';
import { STATUS_COLORS } from '../../constants/game';
import { formatTime } from '../../utils/format';
import styles from './StatusDisplay.module.css';

interface StatusDisplayProps {
  status: MonsterStatus;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  const color = STATUS_COLORS[status.status];
  
  let label: string;
  let timeText: string;
  let progress: number = 100;
  
  if (status.status === 'fed') {
    label = 'Fed';
    const totalTime = 7 * 24 * 60 * 60; // 7 days
    const remaining = Number(status.timeToStarve);
    progress = Math.max(0, Math.min(100, (remaining / totalTime) * 100));
    timeText = `Starves in ${formatTime(status.timeToStarve)}`;
  } else if (status.status === 'hungry') {
    label = 'Hungry';
    const totalTime = 7 * 24 * 60 * 60;
    const remaining = Number(status.timeToStarve);
    progress = Math.max(0, Math.min(100, (remaining / totalTime) * 100));
    timeText = `Starves in ${formatTime(status.timeToStarve)}`;
  } else {
    label = 'Starved';
    progress = 0;
    timeText = 'Can be hunted';
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusRow}>
        <div className={styles.status} style={{ backgroundColor: color }}>
          {label}
        </div>
        <div className={styles.time}>{timeText}</div>
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
