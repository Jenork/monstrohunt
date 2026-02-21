'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { AVATARS, AvatarId } from '../../constants/avatars';
import { TIER_PRICES, TIER_NAMES, Tier } from '../../constants/game';
import { useCreateMonster } from '../../hooks/useCreateMonster';
import { useToast } from '../../hooks/useToast';
import { formatETH } from '../../utils/format';
import styles from './CreateScreen.module.css';

interface CreateScreenProps {
  onCreated?: () => void;
}

export function CreateScreen({ onCreated }: CreateScreenProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(0);
  const [selectedTier, setSelectedTier] = useState<Tier>(0);
  
  const { createMonster, isPending, isSuccess } = useCreateMonster();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isSuccess) return;
    addToast('Monster created successfully!', 'success');
    setName('');
    // Wait for chain state + cache refetch before navigating to Manage
    const t = setTimeout(() => {
      onCreated?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [isSuccess, addToast, onCreated]);

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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Your Monster</h2>
      
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
          <div className={styles.summaryHint}>
            No protocol fees on creation. You can only have one monster per wallet.
          </div>
        </div>

        <button
          className={styles.createButton}
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
        >
          {isPending ? 'Creating...' : `Create ${TIER_NAMES[selectedTier]} Monster`}
        </button>
      </div>
    </div>
  );
}
