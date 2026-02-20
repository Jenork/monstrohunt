'use client';

import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  onLaunch: () => void;
  warning?: string;
}

export function HomeScreen({ onLaunch, warning }: HomeScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>MONSTROHUNT</h1>

        {warning && <div className={styles.warningBanner}>{warning}</div>}

        <button className={styles.launchButton} onClick={onLaunch}>
          PLAY
        </button>
      </div>
    </div>
  );
}
