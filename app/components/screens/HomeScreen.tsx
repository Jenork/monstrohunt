'use client';

import { TIERS, TIER_NAMES } from '../../constants/game';
import { formatETH } from '../../utils/format';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  onLaunch: () => void;
}

export function HomeScreen({ onLaunch }: HomeScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>MONSTROHUNT</h1>
        <p className={styles.subtitle}>Onchain hunting game</p>
        
        <div className={styles.rules}>
          <h2>How to Play</h2>
          <ul>
            <li>Create a monster by choosing a tier: {TIER_NAMES[0]} ({formatETH(TIERS.SCOUT)}), {TIER_NAMES[1]} ({formatETH(TIERS.HUNTER)}), or {TIER_NAMES[2]} ({formatETH(TIERS.LEVIATHAN)})</li>
            <li>Feed your monster regularly (every 7 days) to keep it alive</li>
            <li>Feed cost = 5% initial weight + 5% current weight</li>
            <li>Earn rewards from 75% of hunted monsters' weight (distributed proportionally)</li>
            <li>Hunt starved monsters (7 days without feeding) - 20% reward + cooldown</li>
            <li>Hunt cooldown: 20 minutes after each attempt</li>
            <li>Risk: Lose your monster if you forget to feed!</li>
            <li>Sell your monster anytime (1% fee) - only if not starved</li>
          </ul>
        </div>

        <button className={styles.launchButton} onClick={onLaunch}>
          Launch Game
        </button>
      </div>
    </div>
  );
}
