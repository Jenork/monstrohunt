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
        <p className={styles.subtitle}>Onchain hunting game</p>

        {warning && <div className={styles.warningBanner}>{warning}</div>}

        <button className={styles.launchButton} onClick={onLaunch}>
          Launch Game
        </button>
      </div>
    </div>
  );
}
