'use client';

import { TIERS, TIER_NAMES, HUNGER_DAYS } from '../../constants/game';
import { formatETH } from '../../utils/format';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  onLaunch: () => void;
  warning?: string;
}

const isTestnet = HUNGER_DAYS === 1;

export function HomeScreen({ onLaunch, warning }: HomeScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>MONSTROHUNT</h1>
        <p className={styles.subtitle}>Onchain hunting game{isTestnet ? ' (Testnet)' : ''}</p>
        
        {isTestnet && (
          <div className={styles.testnetBadge}>
            Base Sepolia Testnet - Accelerated timing for testing
          </div>
        )}

        {warning && <div className={styles.warningBanner}>{warning}</div>}
        
        <div className={styles.rules}>
          <h2>How to Play</h2>
          <ul>
            <li>Create a monster by choosing a tier: {TIER_NAMES[0]} ({formatETH(TIERS.SCOUT)}), {TIER_NAMES[1]} ({formatETH(TIERS.HUNTER)}), or {TIER_NAMES[2]} ({formatETH(TIERS.LEVIATHAN)})</li>
            <li>Feed your monster regularly to keep it alive</li>
            <li>If you feed on time, you never lose money</li>
            <li>Earn rewards when other monsters are hunted</li>
            <li>Hunt starved monsters to claim rewards</li>
            <li>Risk: Lose your monster if you forget to feed!</li>
            <li>Sell your monster anytime - only if not starved</li>
          </ul>
          <div className={styles.warning}>
            ⚠️ Hunting is a race. Gas may be lost if someone else hunts first.
          </div>
        </div>

        <button className={styles.launchButton} onClick={onLaunch}>
          Launch Game
        </button>
      </div>
    </div>
  );
}
