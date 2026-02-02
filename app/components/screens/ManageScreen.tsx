'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useMyMonsters } from '../../hooks/useMyMonsters';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useFeedMonster } from '../../hooks/useFeedMonster';
import { useSellMonster } from '../../hooks/useSellMonster';
import { useToast } from '../../hooks/useToast';
import { StatusDisplay } from '../ui/StatusDisplay';
import { AVATARS } from '../../constants/avatars';
import { TIER_NAMES } from '../../constants/game';
import { formatETH } from '../../utils/format';
import { getSellAmount } from '../../utils/monster';
import { isMockMode } from '../../utils/mockData';
import styles from './ManageScreen.module.css';

export function ManageScreen() {
  const { address, isConnected } = usePlayerAddress();
  const { monsterIds, refetch } = useMyMonsters();
  const { addToast } = useToast();
  const { feedMonster, isPending: isFeeding, isSuccess: feedSuccess } = useFeedMonster();
  const { sellMonster, isPending: isSelling, isSuccess: sellSuccess } = useSellMonster();

  useEffect(() => {
    if (feedSuccess || sellSuccess) {
      refetch();
      addToast(feedSuccess ? 'Monster fed successfully!' : 'Monster sold successfully!', 'success');
    }
  }, [feedSuccess, sellSuccess, refetch, addToast]);

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

        {!hasMonsters ? (
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
  const { monster, refetch } = useMonsterInfo(monsterId, { fetchCanHunt: false });
  const { feedMonster, isPending: isFeeding } = useFeedMonster();
  const { sellMonster, isPending: isSelling } = useSellMonster();
  const { addToast } = useToast();

  if (!monster) {
    return <div className={styles.loading}>Loading...</div>;
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
    
    const sellAmount = getSellAmount(monster.weight);
    if (!confirm(`Sell your monster for ${formatETH(sellAmount)} ETH? (1% fee applies)`)) return;
    
    try {
      await sellMonster(monsterId);
      refetch();
    } catch (error: any) {
      addToast(error.message || 'Failed to sell monster', 'error');
    }
  };

  const canFeed = monster.alive;
  const canSell = monster.alive && monster.status.status !== 'starved';
  const isStarved = monster.status.status === 'starved';
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
