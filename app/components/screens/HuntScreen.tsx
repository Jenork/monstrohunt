'use client';

import { useEffect, useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../../utils/contract';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useHuntMonster } from '../../hooks/useHuntMonster';
import { useToast } from '../../hooks/useToast';
import { HuntCard } from '../ui/HuntCard';
import { getHuntCooldownRemaining } from '../../utils/monster';
import { formatTime } from '../../utils/format';
import styles from './HuntScreen.module.css';

export function HuntScreen() {
  const [allMonsterIds, setAllMonsterIds] = useState<number[]>([]);
  const { addToast } = useToast();
  const { huntMonster, isSuccess } = useHuntMonster();
  const { address } = useAccount();

  const { data: totalMonsters } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getTotalMonsters',
  });

  const { data: hunterMonsterId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { monster: hunterMonster } = useMonsterInfo(
    hunterMonsterId && hunterMonsterId > 0n ? Number(hunterMonsterId) : undefined
  );

  useEffect(() => {
    if (isSuccess) {
      addToast('Monster hunted successfully!', 'success');
      loadAllMonsters();
    }
  }, [isSuccess, addToast]);

  useEffect(() => {
    if (totalMonsters) {
      loadAllMonsters();
      const interval = setInterval(loadAllMonsters, 30000);
      return () => clearInterval(interval);
    }
  }, [totalMonsters]);

  const loadAllMonsters = () => {
    if (!totalMonsters) return;
    
    const total = Number(totalMonsters);
    const ids: number[] = [];
    
    // Check monsters starting from ID 1 (0 means no monster)
    for (let i = 1; i <= total; i++) {
      ids.push(i);
    }
    
    setAllMonsterIds(ids);
  };

  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const hunterCooldown = hunterMonster 
    ? getHuntCooldownRemaining(hunterMonster.lastHuntAttemptAt, currentTime)
    : BigInt(0);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hunt Starved Monsters</h2>
      
      <div className={styles.warningBox}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningContent}>
          <div className={styles.warningTitle}>Hunt Risk Warning</div>
          <div className={styles.warningText}>
            Hunt attempts may fail if the monster is fed before your transaction confirms. 
            Gas fees will still be charged even if the hunt fails.
          </div>
        </div>
      </div>

      {hunterCooldown > 0n && (
        <div className={styles.cooldownBox}>
          <div className={styles.cooldownIcon}>⏱</div>
          <div className={styles.cooldownContent}>
            <div className={styles.cooldownTitle}>Hunt Cooldown Active</div>
            <div className={styles.cooldownText}>
              You must wait {formatTime(hunterCooldown)} before hunting again.
            </div>
          </div>
        </div>
      )}

      <div className={styles.infoBox}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Available:</span>
          <span className={styles.infoValue}>{allMonsterIds.length} monsters</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cooldown:</span>
          <span className={styles.infoValue}>20 minutes after each attempt</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Reward:</span>
          <span className={styles.infoValue}>20% of monster weight</span>
        </div>
      </div>

      {allMonsterIds.length === 0 ? (
        <div className={styles.message}>Loading monsters...</div>
      ) : (
        <div className={styles.grid}>
          {allMonsterIds.map((id) => (
            <StarvedMonsterCard key={id} monsterId={id} onHunt={huntMonster} />
          ))}
        </div>
      )}
    </div>
  );
}

function StarvedMonsterCard({ monsterId, onHunt }: { monsterId: number; onHunt: (id: number) => void }) {
  const { monster } = useMonsterInfo(monsterId);
  const { address } = useAccount();

  if (!monster || !monster.alive) {
    return null;
  }

  // Only show monsters that are starved and not owned by current user
  if (monster.status.status !== 'starved' || monster.owner.toLowerCase() === address?.toLowerCase()) {
    return null;
  }

  const canHunt = monster.status.canHunt ?? false;

  return (
    <HuntCard
      monster={monster}
      onHunt={() => onHunt(monsterId)}
      canHunt={canHunt}
    />
  );
}
