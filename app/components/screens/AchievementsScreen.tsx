'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ACHIEVEMENTS } from '../../constants/achievements';
import styles from './AchievementsScreen.module.css';

const SWAMP_CLAIMED_KEY = 'monstro-achievement-swamp-claimed';

export function AchievementsScreen() {
  const [swampClaimed, setSwampClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setSwampClaimed(localStorage.getItem(SWAMP_CLAIMED_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  const handleClaimSwamp = () => {
    if (claiming || swampClaimed) return;
    setClaiming(true);
    // TODO: call ERC-1155 mint when contract is deployed
    setTimeout(() => {
      try {
        localStorage.setItem(SWAMP_CLAIMED_KEY, '1');
      } catch {
        // ignore
      }
      setSwampClaimed(true);
      setClaiming(false);
    }, 600);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Badges</h2>
      <p className={styles.subtitle}>
        Collect NFT badges (ERC‑1155) for your progress. Swamp is free when you enter the app.
      </p>

      <div className={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const isSwamp = a.id === 'swamp';
          const unlocked = isSwamp; // Swamp is always "unlockable" (free), others will come from contract
          const claimed = isSwamp && swampClaimed;

          return (
            <div
              key={a.id}
              className={`${styles.card} ${unlocked ? styles.unlocked : ''} ${claimed ? styles.claimed : ''}`}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={a.image}
                  alt={a.name}
                  width={440}
                  height={440}
                  className={styles.badgeImage}
                />
              </div>
              <h3 className={styles.name}>{a.name}</h3>
              <p className={styles.description}>{a.description}</p>
              <p className={styles.condition}>{a.condition}</p>
              {isSwamp && (
                <button
                  type="button"
                  className={`${styles.claimBtn} ${swampClaimed ? styles.claimBtnClaimed : ''}`}
                  onClick={handleClaimSwamp}
                  disabled={claiming || swampClaimed}
                >
                  {claiming ? '…' : swampClaimed ? 'Claimed' : 'Claim free'}
                </button>
              )}
              {!isSwamp && <span className={styles.lockedLabel}>Unlock in game</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
