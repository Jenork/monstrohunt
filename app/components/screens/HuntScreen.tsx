'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../../utils/contract';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useHuntMonster } from '../../hooks/useHuntMonster';
import { useToast } from '../../hooks/useToast';
import { addHistoryEntry } from '../../utils/historyStore';
import { HuntCard } from '../ui/HuntCard';
import { getHuntCooldownRemaining } from '../../utils/monster';
import { generateMockMonsters, isMockMode } from '../../utils/mockData';
import styles from './HuntScreen.module.css';

export function HuntScreen() {
  const [lastHuntedVictimName, setLastHuntedVictimName] = useState<string | null>(null);
  const { addToast } = useToast();
  const { huntMonster, isSuccess } = useHuntMonster();
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  const { data: totalMonsters, isLoading: isLoadingTotal, isError: isErrorTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getTotalMonsters',
    query: {
      enabled: !mockMode && isContractAddressValid,
      refetchInterval: 30000,
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

  const { data: existingResults, isLoading: isLoadingExisting, isError: isErrorExisting } = useReadContracts({
    contracts: existingMonsterContracts,
    query: {
      enabled: !mockMode && isContractAddressValid && existingMonsterContracts.length > 0,
      refetchInterval: 30000,
    },
  });

  const existingMonsterIds = useMemo(() => {
    if (!existingResults || !Array.isArray(existingResults)) return [];
    return existingResults.flatMap((result, index) =>
      result?.status === 'success' && result.result === true ? [index + 1] : []
    );
  }, [existingResults]);

  const allMonsterIds = useMemo(() => {
    if (mockMode) return generateMockMonsters(8).map((m) => m.id);
    return existingMonsterIds;
  }, [mockMode, existingMonsterIds]);

  const { data: hunterMonsterId, isError: isErrorHunter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && !mockMode && isContractAddressValid,
      refetchInterval: 30000,
    },
  });

  const { monster: hunterMonster } = useMonsterInfo(
    mockMode ? 1 : (hunterMonsterId && hunterMonsterId > 0n ? Number(hunterMonsterId) : undefined)
  );

  useEffect(() => {
    if (!isSuccess) return;
    if (address) addHistoryEntry(address, { type: 'hunted', victimName: lastHuntedVictimName ?? undefined });
    setLastHuntedVictimName(null);
    addToast('Monster hunted successfully!', 'success');
  }, [isSuccess, address, lastHuntedVictimName, addToast]);

  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const hunterCooldown = hunterMonster
    ? getHuntCooldownRemaining(hunterMonster.lastHuntAttemptAt, currentTime)
    : BigInt(0);

  const starvedCount = useMemo(() => {
    if (!mockMode) return existingMonsterIds.length;
    return generateMockMonsters(8).filter((m) => m.status.status === 'starved').length;
  }, [mockMode, existingMonsterIds.length]);

  const contractError = !mockMode && (isErrorTotal || isErrorExisting || isErrorHunter);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hunt</h2>

      {contractError && (
        <div className={styles.message}>
          Failed to load. Check network (Base) and try again.
        </div>
      )}

      {mockMode && (
        <div className={styles.mockNotice}>
          <div className={styles.mockIcon}>Demo</div>
          <div className={styles.mockContent}>
            <div className={styles.mockTitle}>Demo Mode</div>
            <div className={styles.mockText}>
              Showing mock monsters for demonstration. Connect to a deployed contract to see real data.
            </div>
          </div>
        </div>
      )}

      {hunterCooldown > 0n && (
        <div className={styles.cooldownBox}>
          <div className={styles.cooldownIcon}>Wait</div>
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
            {mockMode ? `${starvedCount} starved (demo)` : `${existingMonsterIds.length} created`}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cooldown:</span>
          <span className={styles.infoValue}>Active after each attempt</span>
        </div>
      </div>

      {!contractError && allMonsterIds.length === 0 ? (
        <div className={styles.message}>
          {mockMode || isLoadingTotal || isLoadingExisting ? 'Loading monsters...' : 'No monsters yet.'}
        </div>
      ) : !contractError ? (
        <div className={styles.grid}>
          {allMonsterIds.map((id) => (
            <StarvedMonsterCard
              key={id}
              monsterId={id}
              onHunt={
                mockMode
                  ? () => addToast('Demo mode: Connect to deployed contract to hunt', 'info')
                  : (monsterId, victimName) => {
                      setLastHuntedVictimName(victimName);
                      huntMonster(monsterId);
                    }
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StarvedMonsterCard({
  monsterId,
  onHunt,
}: {
  monsterId: number;
  onHunt: (id: number, victimName: string) => void;
}) {
  const { monster } = useMonsterInfo(monsterId);
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  if (!monster || !monster.alive) {
    return null;
  }

  if (address && monster.owner.toLowerCase() === address.toLowerCase()) {
    return null;
  }
  if (mockMode && monster.id === 1 && address) {
    return null;
  }

  const canHunt = mockMode
    ? monster.status.status === 'starved' && monster.id !== 1
    : (monster.status.canHunt ?? false);

  return (
    <HuntCard
      monster={monster}
      onHunt={() => onHunt(monsterId, monster.name)}
      canHunt={canHunt}
    />
  );
}
