'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useChainId, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import { AVATARS, AvatarId } from '../../constants/avatars';
import { TIER_PRICES, TIER_NAMES, Tier } from '../../constants/game';
import { useCreateMonster } from '../../hooks/useCreateMonster';
import { useMyMonsters } from '../../hooks/useMyMonsters';
import { useToast } from '../../hooks/useToast';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { addHistoryEntry } from '../../utils/historyStore';
import { formatETH } from '../../utils/format';
import styles from './CreateScreen.module.css';

interface CreateScreenProps {
  onCreated?: () => void;
}

export function CreateScreen({ onCreated }: CreateScreenProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(0);
  const [selectedTier, setSelectedTier] = useState<Tier>(1); // Hunter by default
  
  const { address, isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address, chainId: base.id });
  const { monsterIds, isLoading: isLoadingMonsters } = useMyMonsters();
  const { createMonster, isPending, isSuccess } = useCreateMonster();
  const { addToast } = useToast();
  const isWrongNetwork = isConnected && chainId !== base.id;
  const alreadyHasMonster = monsterIds.length > 0;

  useEffect(() => {
    if (!isSuccess || !address) return;
    try {
      addHistoryEntry(address, { type: 'created', monsterName: name });
    } catch {
      // history store is best-effort; don't block success UX
    }
    addToast('Monster created successfully!', 'success');
    setName('');
    const t = setTimeout(() => {
      onCreated?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [isSuccess, address, name, addToast, onCreated]);

  const handlePreviousAvatar = () => {
    const currentIndex = AVATARS.findIndex(a => a.id === selectedAvatar);
    const previousIndex = currentIndex <= 0 ? AVATARS.length - 1 : currentIndex - 1;
    setSelectedAvatar(AVATARS[previousIndex].id);
  };

  const handleNextAvatar = () => {
    const currentIndex = AVATARS.findIndex(a => a.id === selectedAvatar);
    const nextIndex = currentIndex >= AVATARS.length - 1 ? 0 : currentIndex + 1;
    setSelectedAvatar(AVATARS[nextIndex].id);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      addToast('Please enter a name', 'error');
      return;
    }
    if (name.length > 31) {
      addToast('Name must be 31 characters or less', 'error');
      return;
    }
    createMonster(name, selectedAvatar, selectedTier);
  };

  const selectedTierPrice = TIER_PRICES[selectedTier];
  const estimatedGas = 50000000000000n; // ~0.00005 ETH (Base gas is cheap)
  const requiredTotal = selectedTierPrice + estimatedGas;
  const hasInsufficientBalance = balance && balance.value < requiredTotal;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Your Monster</h2>

      {isWrongNetwork && (
        <div className={styles.networkWarning}>
          Switch to <strong>Base</strong> network in your wallet. Creation works only on Base.
        </div>
      )}

      {hasInsufficientBalance && isConnected && (
        <div className={styles.networkWarning}>
          Insufficient balance. You need ~{formatETH(requiredTotal)} ETH (tier + gas). Your balance: {balance ? formatETH(balance.value) : '—'} ETH.
        </div>
      )}

      {alreadyHasMonster && isConnected && !isLoadingMonsters && (
        <div className={styles.networkWarning}>
          You already have a monster. Go to <strong>Manage</strong> to feed or sell it. One monster per wallet.
        </div>
      )}

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.avatarSelector}>
            <button
              className={styles.arrowButton}
              onClick={handlePreviousAvatar}
              aria-label="Previous avatar"
            >
              ‹
            </button>
            <div className={styles.avatarDisplay}>
              <Image
                src={AVATARS.find(a => a.id === selectedAvatar)?.image || AVATARS[0].image}
                alt={AVATARS.find(a => a.id === selectedAvatar)?.name || AVATARS[0].name}
                width={1728}
                height={1728}
                className={styles.avatarImg}
              />
              <div className={styles.avatarName}>
                {AVATARS.find(a => a.id === selectedAvatar)?.name || AVATARS[0].name}
              </div>
            </div>
            <button
              className={styles.arrowButton}
              onClick={handleNextAvatar}
              aria-label="Next avatar"
            >
              ›
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Monster Name (max 31 chars)</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={31}
            placeholder="Enter monster name"
          />
        </div>

        <div className={styles.section}>
          <div className={styles.tierGroup}>
            {([0, 1, 2] as Tier[]).map((tier) => {
              const tierPrice = TIER_PRICES[tier];
              const isSelected = selectedTier === tier;
              
              return (
                <label
                  key={tier}
                  className={`${styles.tierOption} ${isSelected ? styles.tierOptionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    checked={isSelected}
                    onChange={() => setSelectedTier(tier)}
                    className={styles.tierRadio}
                  />
                  <div className={styles.tierContent}>
                    <div className={styles.tierName}>{TIER_NAMES[tier]}</div>
                    <div className={styles.tierPrice}>{formatETH(tierPrice)} ETH</div>
                    <div className={styles.tierDescription}>
                      {tier === 0 && 'Entry level'}
                      {tier === 1 && 'Balanced'}
                      {tier === 2 && 'Premium'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Cost:</span>
            <span className={styles.summaryValue}>{formatETH(selectedTierPrice)} ETH</span>
          </div>
          {isConnected && balance && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Your balance:</span>
              <span className={styles.summaryValue}>{formatETH(balance.value)} ETH</span>
            </div>
          )}
          <div className={styles.summaryHint}>
            No protocol fees on creation. One monster per wallet. Need tier amount + gas (~0.00005 ETH) in Base.
          </div>
        </div>

        <button
          className={styles.createButton}
          onClick={handleCreate}
          disabled={isPending || !name.trim() || isWrongNetwork || !!hasInsufficientBalance || alreadyHasMonster}
        >
          {isPending ? 'Creating...' : `Create ${TIER_NAMES[selectedTier]} Monster`}
        </button>
      </div>
    </div>
  );
}
