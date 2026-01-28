'use client';

import Image from 'next/image';
import { MonsterInfo } from '../../types/monster';
import { AVATARS } from '../../constants/avatars';
import { TIER_NAMES } from '../../constants/game';
import { formatETH, formatAddress } from '../../utils/format';
import { StatusDisplay } from './StatusDisplay';
import styles from './HuntCard.module.css';

interface HuntCardProps {
  monster: MonsterInfo;
  onHunt: () => void;
  canHunt: boolean;
}

export function HuntCard({ monster, onHunt, canHunt }: HuntCardProps) {
  const avatar = AVATARS.find((a) => a.id === monster.avatarId) || AVATARS[0];
  
  // Calculate potential reward (20% of weight)
  const potentialReward = (monster.weight * BigInt(2000)) / BigInt(10000);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <Image
            src={avatar.image}
            alt={avatar.name}
            width={720}
            height={720}
            className={styles.avatarImage}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{monster.name}</div>
          <div className={styles.tier}>Tier: {TIER_NAMES[monster.tier]}</div>
          <div className={styles.owner}>{formatAddress(monster.owner)}</div>
        </div>
      </div>
      <div className={styles.weightSection}>
        <div className={styles.weightLabel}>Weight</div>
        <div className={styles.weight}>{formatETH(monster.weight)} ETH</div>
      </div>
      <StatusDisplay status={monster.status} />
      <div className={styles.rewardSection}>
        <div className={styles.rewardLabel}>Potential Reward</div>
        <div className={styles.rewardAmount}>{formatETH(potentialReward)} ETH</div>
        <div className={styles.rewardHint}>20% of weight</div>
      </div>
      <button
        className={`${styles.huntButton} ${canHunt ? styles.enabled : styles.disabled}`}
        onClick={onHunt}
        disabled={!canHunt}
      >
        {canHunt ? 'Hunt Monster' : 'Cannot Hunt'}
      </button>
      {!canHunt && (
        <div className={styles.disabledReason}>
          {monster.status.canHunt === false ? 'Cooldown active or conditions not met' : 'Cannot hunt this monster'}
        </div>
      )}
    </div>
  );
}
