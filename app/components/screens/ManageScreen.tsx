'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMyMonsters } from '../../hooks/useMyMonsters';
import { useMonsterInfo } from '../../hooks/useMonsterInfo';
import { useFeedMonster } from '../../hooks/useFeedMonster';
import { useSellMonster } from '../../hooks/useSellMonster';
import { useToast } from '../../hooks/useToast';
import { MonsterCard } from '../ui/MonsterCard';
import { formatETH, formatAddress } from '../../utils/format';
import { getSellAmount } from '../../utils/monster';
import { isMockMode, getMockProfile } from '../../utils/mockData';
import styles from './ManageScreen.module.css';

export function ManageScreen() {
  const { address, isConnected } = useAccount();
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
      <div className={styles.container}>
        <div className={styles.message}>Please connect your wallet</div>
      </div>
    );
  }

  const mockMode = isMockMode();
  const profile = getMockProfile(address);
  const hasMonsters = monsterIds.length > 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Profile</h2>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>👤</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>{profile.displayName}</div>
          <div className={styles.profileAddress}>
            {address ? formatAddress(address) : '—'}
          </div>
          <div className={styles.profileStats}>
            <span className={styles.profileStat}>
              <strong>Monsters:</strong> {monsterIds.length}
            </span>
            <span className={styles.profileStat}>
              <strong>Hunts won:</strong> {profile.huntsWon}
            </span>
            <span className={styles.profileStat}>
              <strong>Total rewards:</strong> {formatETH(profile.totalRewardsEarned)} ETH
            </span>
            <span className={styles.profileStat}>
              <strong>Member since:</strong> {profile.memberSince}
            </span>
          </div>
        </div>
      </div>

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
        <>
          <h3 className={styles.sectionTitle}>My Monster</h3>
          <div className={styles.grid}>
            {monsterIds.map((id) => (
              <MonsterManager key={id.toString()} monsterId={Number(id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MonsterManager({ monsterId }: { monsterId: number }) {
  const { monster, refetch } = useMonsterInfo(monsterId, { fetchCanHunt: false });
  const { feedMonster, isPending: isFeeding } = useFeedMonster();
  const { sellMonster, isPending: isSelling } = useSellMonster();
  const { addToast } = useToast();

  useEffect(() => {
    refetch();
  }, [refetch]);

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

  return (
    <div className={styles.monsterWrapper}>
      <MonsterCard monster={monster} />
      <div className={styles.actions}>
        <div className={styles.feedSection}>
          <div className={styles.feedInfo}>
            <div className={styles.feedLabel}>Feed Cost Today</div>
            <div className={styles.feedCost}>
              {monster.feedCost ? formatETH(monster.feedCost) : '...'} ETH
            </div>
            <div className={styles.feedHint}>
              {isStarved 
                ? '⚠️ Your monster is starved! Feed now to save it.'
                : 'Feed regularly to keep your monster alive'}
            </div>
          </div>
          <button
            className={`${styles.feedButton} ${isStarved ? styles.feedButtonUrgent : ''}`}
            onClick={handleFeed}
            disabled={isFeeding || !canFeed}
          >
            {isFeeding ? 'Feeding...' : isStarved ? 'Feed Now (Urgent!)' : 'Feed Monster'}
          </button>
        </div>
        
        <div className={styles.sellSection}>
          <div className={styles.sellInfo}>
            <div className={styles.sellLabel}>Sell Amount</div>
            <div className={styles.sellAmount}>
              {monster.weight ? formatETH(getSellAmount(monster.weight)) : '...'} ETH
            </div>
            <div className={styles.sellHint}>Protocol fee applies</div>
          </div>
          <button
            className={styles.sellButton}
            onClick={handleSell}
            disabled={isSelling || !canSell}
          >
            {isSelling ? 'Selling...' : 'Sell Monster'}
          </button>
        </div>
      </div>
    </div>
  );
}
