'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useMyMonsters } from '../../hooks/useMyMonsters';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useFeedMonster } from '../../hooks/useFeedMonster';
import { useSellMonster } from '../../hooks/useSellMonster';
import { useToast } from '../../hooks/useToast';
import { addHistoryEntry, addVictimEntry, hasVictimEntryForMonster } from '../../utils/historyStore';
import { StatusDisplay } from '../ui/StatusDisplay';
import { AVATARS } from '../../constants/avatars';
import { TIER_NAMES, HUNGER_DAYS } from '../../constants/game';
import { formatETH, formatAddress } from '../../utils/format';
import { getErrorMessage } from '../../utils/error';
import { getSellAmount } from '../../utils/monster';
import { isMockMode } from '../../utils/mockData';
import { useHunterOfDeadMonster } from '../../hooks/useHunterOfDeadMonster';
import styles from './ManageScreen.module.css';

export function ManageScreen() {
  const { address, isConnected } = usePlayerAddress();
  const { monsterIds, refetch, isLoading: isLoadingList, isError: isListError } = useMyMonsters();
  const { addToast } = useToast();
  const { isSuccess: feedSuccess } = useFeedMonster();
  const { isSuccess: sellSuccess } = useSellMonster();

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
          <div className={styles.message}>Connect your wallet to manage your monster.</div>
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
            <div className={styles.mockIcon}>Demo</div>
            <div className={styles.mockContent}>
              <div className={styles.mockTitle}>Demo Mode</div>
              <div className={styles.mockText}>
                Showing mock monster data. Connect to a deployed contract to manage your real
                monster.
              </div>
            </div>
          </div>
        )}

        {isLoadingList ? (
          <div className={styles.message}>Loading your monster...</div>
        ) : isListError ? (
          <div className={styles.message}>Failed to load. Check network (Base) and try again.</div>
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
  const {
    monster,
    refetch,
    isLoading: isLoadingMonster,
    isError: isMonsterError,
  } = useMonsterInfo(monsterId, { fetchCanHunt: false });
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
    return <div className={styles.loading}>Loading monster...</div>;
  }

  if (!monster || isMonsterError) {
    return (
      <div className={styles.loading}>
        <span>Failed to load monster.</span>
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

    try {
      await feedMonster(monsterId, monster.feedCost);
      refetch();
    } catch (error: unknown) {
      addToast(getErrorMessage(error, 'Failed to feed monster'), 'error');
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
    } catch (error: unknown) {
      addToast(getErrorMessage(error, 'Failed to sell monster'), 'error');
    }
  };

  const canFeed = monster.alive && isConnected && !isWrongNetwork;
  const canSell = monster.alive && monster.status.status !== 'starved' && isConnected && !isWrongNetwork;
  const isStarved = monster.status.status === 'starved';
  const actionHint = !isConnected
    ? 'Connect wallet'
    : isWrongNetwork
      ? 'Switch to Base'
      : !monster.alive
        ? 'Monster is dead'
        : isStarved
          ? 'Feed first to sell'
          : '';
  const feedLabel = isFeeding
    ? 'Feeding...'
    : !isConnected
      ? 'Connect Wallet'
      : isWrongNetwork
        ? 'Switch to Base'
        : !monster.alive
          ? 'Monster Dead'
          : isStarved
            ? 'Feed Now'
            : 'Feed';
  const sellLabel = isSelling
    ? 'Selling...'
    : !isConnected
      ? 'Connect Wallet'
      : isWrongNetwork
        ? 'Switch to Base'
        : !monster.alive
          ? 'Monster Dead'
          : isStarved
            ? 'Feed First'
            : 'Sell';
  const avatar = AVATARS.find((item) => item.id === monster.avatarId) || AVATARS[0];

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
          <div className={styles.hungerPeriodHint}>Feed within {HUNGER_DAYS} days</div>
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
          {!canFeed && actionHint && <span className={styles.actionHint}>{actionHint}</span>}
        </div>
        <button
          type="button"
          className={`${styles.cardFeedBtn} ${isStarved ? styles.cardFeedBtnUrgent : ''}`}
          onClick={handleFeed}
          disabled={isFeeding || !canFeed}
        >
          {feedLabel}
        </button>
      </div>
      <div className={styles.cardDivider} />
      <div className={styles.cardSellRow}>
        <div className={styles.cardSellInfo}>
          <span className={styles.cardSellLabel}>Sell</span>
          <span className={styles.cardSellAmount}>
            {monster.weight ? formatETH(getSellAmount(monster.weight)) : '...'} ETH
          </span>
          {!canSell && actionHint && <span className={styles.actionHint}>{actionHint}</span>}
        </div>
        <button
          type="button"
          className={styles.cardSellBtn}
          onClick={handleSell}
          disabled={isSelling || !canSell}
        >
          {sellLabel}
        </button>
      </div>
    </div>
  );
}
