'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { useChainId, useReadContract, useReadContracts } from 'wagmi';
import { base } from 'wagmi/chains';
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
  const { address, isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const mockMode = isMockMode();
  const isWrongNetwork = isConnected && chainId !== base.id;

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
        ? Array.from({ length: totalNum }, (_, index) => ({
            address: CONTRACT_ADDRESS,
            abi: monstroHuntABI,
            functionName: 'monsterExists' as const,
            args: [BigInt(index + 1)] as const,
          }))
        : [],
    [totalNum]
  );

  const {
    data: existingResults,
    isLoading: isLoadingExisting,
    isError: isErrorExisting,
  } = useReadContracts({
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
    if (mockMode) return generateMockMonsters(8).map((monster) => monster.id);
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
    mockMode ? 1 : hunterMonsterId && hunterMonsterId > 0n ? Number(hunterMonsterId) : undefined
  );

  useEffect(() => {
    if (!isSuccess) return;
    if (address) {
      addHistoryEntry(address, { type: 'hunted', victimName: lastHuntedVictimName ?? undefined });
    }
    setLastHuntedVictimName(null);
    addToast('Monster hunted successfully!', 'success');
  }, [isSuccess, address, lastHuntedVictimName, addToast]);

  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const hunterCooldown = hunterMonster
    ? getHuntCooldownRemaining(hunterMonster.lastHuntAttemptAt, currentTime)
    : BigInt(0);

  const starvedCount = useMemo(() => {
    if (!mockMode) return existingMonsterIds.length;
    return generateMockMonsters(8).filter((monster) => monster.status.status === 'starved').length;
  }, [mockMode, existingMonsterIds.length]);

  const contractError = !mockMode && (isErrorTotal || isErrorExisting || isErrorHunter);
  const globalHuntHint = !isConnected
    ? 'Connect your wallet to hunt starved monsters.'
    : isWrongNetwork
      ? 'Switch to Base to interact with the hunt contract.'
      : hunterCooldown > 0n
        ? 'Your monster is on cooldown after the previous hunt attempt.'
        : !hunterMonster?.alive
          ? 'You need a living monster before you can hunt others.'
          : '';

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hunt</h2>

      {globalHuntHint && <div className={styles.message}>{globalHuntHint}</div>}

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
              Showing mock monsters for demonstration. Connect to a deployed contract to see real
              data.
            </div>
          </div>
        </div>
      )}

      {hunterCooldown > 0n && (
        <div className={styles.cooldownBox}>
          <div className={styles.cooldownIcon}>Wait</div>
          <div className={styles.cooldownContent}>
            <div className={styles.cooldownTitle}>Hunt Cooldown Active</div>
            <div className={styles.cooldownText}>Please wait before hunting again.</div>
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
              isConnected={isConnected}
              isWrongNetwork={isWrongNetwork}
              hasHunterMonster={!!hunterMonster?.alive}
              hasCooldown={hunterCooldown > 0n}
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
  isConnected,
  isWrongNetwork,
  hasHunterMonster,
  hasCooldown,
}: {
  monsterId: number;
  onHunt: (id: number, victimName: string) => void;
  isConnected: boolean;
  isWrongNetwork: boolean;
  hasHunterMonster: boolean;
  hasCooldown: boolean;
}) {
  const { monster } = useMonsterInfo(monsterId);
  const { address } = usePlayerAddress();
  const mockMode = isMockMode();

  if (!monster || !monster.alive) return null;
  if (address && monster.owner.toLowerCase() === address.toLowerCase()) return null;
  if (mockMode && monster.id === 1 && address) return null;

  const canHunt = mockMode
    ? monster.status.status === 'starved' && monster.id !== 1
    : (monster.status.canHunt ?? false);
  const disabledReason = !isConnected
    ? 'Connect Wallet'
    : isWrongNetwork
      ? 'Switch to Base'
      : !hasHunterMonster
        ? 'Need Your Monster'
        : hasCooldown
          ? 'Cooldown Active'
          : 'Cannot Hunt';
  const disabledHint = !isConnected
    ? 'Wallet connection is required to submit a hunt.'
    : isWrongNetwork
      ? 'Hunting works only on Base.'
      : !hasHunterMonster
        ? 'Create or keep a living monster before hunting others.'
        : hasCooldown
          ? 'Wait for cooldown to expire before the next hunt.'
          : 'This monster is not huntable right now.';

  return (
    <HuntCard
      monster={monster}
      onHunt={() => onHunt(monsterId, monster.name)}
      canHunt={canHunt}
      actionLabel={disabledReason}
      actionHint={canHunt ? undefined : disabledHint}
    />
  );
}
