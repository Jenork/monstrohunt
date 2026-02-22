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
        <p className={styles.subtitle}>Create a monster, feed it in time, hunt others for ETH.</p>

        {warning && <div className={styles.warningBanner}>{warning}</div>}

        <button className={styles.launchButton} onClick={onLaunch}>
          PLAY
        </button>
      </div>
    </div>
  );
}
