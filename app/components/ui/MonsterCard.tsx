'use client';

import Image from 'next/image';
import { MonsterInfo } from '../../types/monster';
import { AVATARS } from '../../constants/avatars';
import { TIER_NAMES } from '../../constants/game';
import { formatETH } from '../../utils/format';
import { StatusDisplay } from './StatusDisplay';
import styles from './MonsterCard.module.css';

interface MonsterCardProps {
  monster: MonsterInfo;
  onClick?: () => void;
}

export function MonsterCard({ monster, onClick }: MonsterCardProps) {
  const avatar = AVATARS.find((a) => a.id === monster.avatarId) || AVATARS[0];

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.avatar}>
        <Image
          src={avatar.image}
          alt={avatar.name}
          width={1152}
          height={1152}
          className={styles.avatarImage}
        />
      </div>
      <div className={styles.name}>{monster.name}</div>
      <div className={styles.tier}>Tier: {TIER_NAMES[monster.tier]}</div>
      <div className={styles.weightInfo}>
        <div className={styles.weightLabel}>Weight</div>
        <div className={styles.weight}>{formatETH(monster.weight)} ETH</div>
      </div>
      <StatusDisplay status={monster.status} />
      {monster.pendingRewards > 0 && (
        <div className={styles.rewards}>
          <span className={styles.rewardsLabel}>Pending Rewards:</span>
          <span className={styles.rewardsAmount}>+{formatETH(monster.pendingRewards)} ETH</span>
        </div>
      )}
    </div>
  );
}
