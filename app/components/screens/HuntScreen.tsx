'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../../utils/contract';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useHuntMonster } from '../../hooks/useHuntMonster';
import { useToast } from '../../hooks/useToast';
import { HuntCard } from '../ui/HuntCard';
import { getHuntCooldownRemaining } from '../../utils/monster';
import { generateMockMonsters, isMockMode } from '../../utils/mockData';
import styles from './HuntScreen.module.css';

export function HuntScreen() {
  const [allMonsterIds, setAllMonsterIds] = useState<number[]>([]);
  const { addToast } = useToast();
  const { huntMonster, isSuccess } = useHuntMonster();
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  const { data: totalMonsters } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getTotalMonsters',
    query: {
      enabled: !mockMode,
    },
  });

  const totalNum = totalMonsters !== undefined ? Number(totalMonsters) : 0;
  const existingMonsterContracts = useMemo(
    () =>
      totalNum > 0
        ? Array.from({ length: totalNum }, (_, i) => ({
            address: CONTRACT_ADDRESS,
            abi: monstroHuntABI,
            functionName: 'monsterExists' as const,
            args: [BigInt(i + 1)] as const,
          }))
        : [],
    [totalNum]
  );

  const { data: existingResults } = useReadContracts({
    contracts: existingMonsterContracts,
    query: {
      enabled: !mockMode && existingMonsterContracts.length > 0,
    },
  });

  const existingMonsterCount = useMemo(() => {
    if (!existingResults || !Array.isArray(existingResults)) return 0;
    return existingResults.filter(
      (r): r is { result: boolean; status: 'success' } =>
        r?.status === 'success' && r?.result === true
    ).length;
  }, [existingResults]);

  const { data: hunterMonsterId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !mockMode,
    },
  });

  const { monster: hunterMonster } = useMonsterInfo(
    mockMode ? 1 : (hunterMonsterId && hunterMonsterId > 0n ? Number(hunterMonsterId) : undefined)
  );

  useEffect(() => {
    if (isSuccess) {
      addToast('Monster hunted successfully!', 'success');
      loadAllMonsters();
    }
  }, [isSuccess, addToast]);

  useEffect(() => {
    if (mockMode) {
      // В mock режиме показываем 8 монстров
      const mockMonsters = generateMockMonsters(8);
      setAllMonsterIds(mockMonsters.map(m => m.id));
    } else if (totalMonsters) {
      loadAllMonsters();
      const interval = setInterval(loadAllMonsters, 30000);
      return () => clearInterval(interval);
    }
  }, [totalMonsters, mockMode]);

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

  const starvedCount = useMemo(() => {
    if (!mockMode) return allMonsterIds.length;
    return generateMockMonsters(8).filter(m => m.status.status === 'starved').length;
  }, [mockMode, allMonsterIds.length]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hunt Starved Monsters</h2>
      
      {mockMode && (
        <div className={styles.mockNotice}>
          <div className={styles.mockIcon}>🎮</div>
          <div className={styles.mockContent}>
            <div className={styles.mockTitle}>Demo Mode</div>
            <div className={styles.mockText}>
              Showing mock monsters for demonstration. Connect to a deployed contract to see real data.
            </div>
          </div>
        </div>
      )}
      
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
              Please wait before hunting again.
            </div>
          </div>
        </div>
      )}

      <div className={styles.infoBox}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Monsters now:</span>
          <span className={styles.infoValue}>
            {mockMode ? `${starvedCount} starved (demo)` : `${existingMonsterCount} created`}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cooldown:</span>
          <span className={styles.infoValue}>Active after each attempt</span>
        </div>
      </div>

      {allMonsterIds.length === 0 ? (
        <div className={styles.message}>Loading monsters...</div>
      ) : (
        <div className={styles.grid}>
          {allMonsterIds.map((id) => (
            <StarvedMonsterCard key={id} monsterId={id} onHunt={mockMode ? () => addToast('Demo mode: Connect to deployed contract to hunt', 'info') : huntMonster} />
          ))}
        </div>
      )}
    </div>
  );
}

function StarvedMonsterCard({ monsterId, onHunt }: { monsterId: number; onHunt: (id: number) => void }) {
  const { monster } = useMonsterInfo(monsterId);
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  if (!monster || !monster.alive) {
    return null;
  }

  // В mock режиме показываем всех монстров, кроме вашего (ID 1)
  // В реальном режиме показываем только starved и не своих
  if (mockMode) {
    if (monster.id === 1 && address) {
      return null; // Не показываем свой монстр
    }
  } else {
    // Only show monsters that are starved and not owned by current user
    if (monster.status.status !== 'starved' || monster.owner.toLowerCase() === address?.toLowerCase()) {
      return null;
    }
  }

  const canHunt = mockMode 
    ? (monster.status.status === 'starved' && monster.id !== 1)
    : (monster.status.canHunt ?? false);

  return (
    <HuntCard
      monster={monster}
      onHunt={() => onHunt(monsterId)}
      canHunt={canHunt}
    />
  );
}
