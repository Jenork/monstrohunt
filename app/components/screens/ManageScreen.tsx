'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useMyMonsters } from '../../hooks/useMyMonsters';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useFeedMonster } from '../../hooks/useFeedMonster';
import { useSellMonster } from '../../hooks/useSellMonster';
import { useToast } from '../../hooks/useToast';
import { addHistoryEntry, addVictimEntry, hasVictimEntryForMonster } from '../../utils/historyStore';
import { useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { StatusDisplay } from '../ui/StatusDisplay';
import { AVATARS } from '../../constants/avatars';
import { TIER_NAMES } from '../../constants/game';
import { formatETH } from '../../utils/format';
import { getSellAmount } from '../../utils/monster';
import { formatAddress } from '../../utils/format';
import { isMockMode } from '../../utils/mockData';
import { useHunterOfDeadMonster } from '../../hooks/useHunterOfDeadMonster';
import styles from './ManageScreen.module.css';

export function ManageScreen() {
  const { address, isConnected } = usePlayerAddress();
  const { monsterIds, refetch, isLoading: isLoadingList, isError: isListError } = useMyMonsters();
  const { addToast } = useToast();
  const { feedMonster, isPending: isFeeding, isSuccess: feedSuccess } = useFeedMonster();
  const { sellMonster, isPending: isSelling, isSuccess: sellSuccess } = useSellMonster();

  // Refetch when opening Manage (e.g. right after creating a monster)
  useEffect(() => {
    if (address) refetch();
  }, [address, refetch]);

  useEffect(() => {
    if (feedSuccess || sellSuccess) {
      if (feedSuccess && address) addHistoryEntry(address, { type: 'fed' });
      refetch();
      addToast(feedSuccess ? 'Monster fed successfully!' : 'Monster sold successfully!', 'success');
    }
  }, [feedSuccess, sellSuccess, address, refetch, addToast]);

  if (!isConnected) {
    return (
      <div className={styles.centerWrap}>
        <div className={styles.container}>
          <div className={styles.message}>Please connect your wallet</div>
        </div>
      </div>
    );
  }

  const mockMode = isMockMode();
  const hasMonsters = monsterIds.length > 0;

  return (
    <div className={styles.centerWrap}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Monster</h2>

        {mockMode && (
          <div className={styles.mockNotice}>
            <div className={styles.mockIcon}>🎮</div>
            <div className={styles.mockContent}>
              <div className={styles.mockTitle}>Demo Mode</div>
              <div className={styles.mockText}>
                Showing mock monster data. Connect to a deployed contract to manage your real monster.
              </div>
            </div>
          </div>
        )}

        {isLoadingList ? (
          <div className={styles.message}>Loading...</div>
        ) : isListError ? (
          <div className={styles.message}>
            Failed to load. Check network (Base) and try again.
          </div>
        ) : !hasMonsters ? (
          <div className={styles.message}>You don&apos;t have a monster yet. Create one!</div>
        ) : (
          <div className={styles.grid}>
            {monsterIds.map((id) => (
              <MonsterManager key={id.toString()} monsterId={Number(id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MonsterManager({ monsterId }: { monsterId: number }) {
  const { monster, refetch, isLoading: isLoadingMonster, isError: isMonsterError } = useMonsterInfo(monsterId, { fetchCanHunt: false });
  const { address, isConnected } = usePlayerAddress();
  const hunterAddress = useHunterOfDeadMonster(monsterId, !!monster && !monster.alive);
  const { feedMonster, isPending: isFeeding } = useFeedMonster();
  const { sellMonster, isPending: isSelling } = useSellMonster();
  const { addToast } = useToast();
  const chainId = useChainId();
  const isWrongNetwork = isConnected && chainId !== base.id;

  useEffect(() => {
    if (!address || !monster || monster.alive || !hunterAddress) return;
    if (hasVictimEntryForMonster(address, monsterId)) return;
    addVictimEntry(address, formatAddress(hunterAddress), monsterId);
  }, [address, monster, hunterAddress, monsterId]);

  if (isLoadingMonster) {
    return <div className={styles.loading}>Loading...</div>;
  }
  if (!monster || isMonsterError) {
    return (
      <div className={styles.loading}>
        <span>Failed to load monster. </span>
        <button type="button" onClick={() => refetch()} className={styles.retryLink}>
          Retry
        </button>
      </div>
    );
  }

  const handleFeed = async () => {
    if (!monster.feedCost) {
      addToast('Unable to calculate feed cost', 'error');
      return;
    }
    
    if (monster.status.status === 'starved') {
      if (!confirm('Your monster is starved! Feeding now will save it. Continue?')) {
        return;
      }
    }
    
    try {
      await feedMonster(monsterId, monster.feedCost);
      refetch();
    } catch (error: any) {
      addToast(error.message || 'Failed to feed monster', 'error');
    }
  };

  const handleSell = async () => {
    if (monster.status.status === 'starved') {
      addToast('Cannot sell a starved monster. Feed it first or wait to be hunted.', 'error');
      return;
    }
    try {
      await sellMonster(monsterId);
      refetch();
    } catch (error: any) {
      addToast(error.message || 'Failed to sell monster', 'error');
    }
  };

  const canFeed = monster.alive && isConnected && !isWrongNetwork;
  const canSell =
    monster.alive && monster.status.status !== 'starved' && isConnected && !isWrongNetwork;
  const isStarved = monster.status.status === 'starved';
  const actionHint = !isConnected
    ? 'Connect wallet'
    : isWrongNetwork
      ? 'Switch to Base'
      : isStarved
        ? 'Feed first to sell'
        : '';
  const avatar = AVATARS.find((a) => a.id === monster.avatarId) || AVATARS[0];

  return (
    <div className={styles.unifiedCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardAvatar}>
          <Image
            src={avatar.image}
            alt={avatar.name}
            width={96}
            height={96}
            className={styles.cardAvatarImage}
          />
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>{monster.name}</div>
          <div className={styles.cardTier}>Tier: {TIER_NAMES[monster.tier]}</div>
          <div className={styles.cardWeight}>{formatETH(monster.weight)} ETH</div>
          <StatusDisplay status={monster.status} />
          {monster.pendingRewards > 0 && (
            <div className={styles.cardRewards}>+{formatETH(monster.pendingRewards)} ETH</div>
          )}
        </div>
      </div>
      <div className={styles.cardFeedRow}>
        <div className={styles.cardFeedInfo}>
          <span className={styles.cardFeedLabel}>Feed</span>
          <span className={styles.cardFeedCost}>
            {monster.feedCost ? formatETH(monster.feedCost) : '...'} ETH
          </span>
          {!canFeed && actionHint && (
            <span className={styles.actionHint}>{actionHint}</span>
          )}
        </div>
        <button
          type="button"
          className={`${styles.cardFeedBtn} ${isStarved ? styles.cardFeedBtnUrgent : ''}`}
          onClick={handleFeed}
          disabled={isFeeding || !canFeed}
        >
          {isFeeding ? '…' : isStarved ? 'Feed Now' : 'Feed'}
        </button>
      </div>
      <div className={styles.cardDivider} />
      <div className={styles.cardSellRow}>
        <div className={styles.cardSellInfo}>
          <span className={styles.cardSellLabel}>Sell</span>
          <span className={styles.cardSellAmount}>
            {monster.weight ? formatETH(getSellAmount(monster.weight)) : '...'} ETH
          </span>
          {!canSell && actionHint && (
            <span className={styles.actionHint}>{actionHint}</span>
          )}
        </div>
        <button
          type="button"
          className={styles.cardSellBtn}
          onClick={handleSell}
          disabled={isSelling || !canSell}
        >
          {isSelling ? '…' : 'Sell'}
        </button>
      </div>
    </div>
  );
}
