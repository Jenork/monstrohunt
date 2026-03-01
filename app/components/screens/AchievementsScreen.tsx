'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '../../constants/achievements';
import { BADGES_CONTRACT_ADDRESS, isBadgesAddressValid } from '../../utils/contract';
import { monstroHuntBadgesABI, BADGES_TOKEN_IDS } from '../../contracts/monstroHuntBadges';
import { useBadgeBalances } from '../../hooks/useBadgeBalances';
import styles from './AchievementsScreen.module.css';

const OPENSEA_BADGES_URL = `https://opensea.io/assets/base/${BADGES_CONTRACT_ADDRESS}`;

export function AchievementsScreen() {
  const { address } = useAccount();
  const [claiming, setClaiming] = useState(false);
  const balances = useBadgeBalances();

  const { data: hasClaimedSwamp, refetch: refetchHasClaimed } = useReadContract({
    address: BADGES_CONTRACT_ADDRESS,
    abi: monstroHuntBadgesABI,
    functionName: 'hasClaimedSwamp',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isBadgesAddressValid },
  });

  const swampClaimed = (balances[BADGES_TOKEN_IDS.swamp] !== undefined && balances[BADGES_TOKEN_IDS.swamp] > 0n) || (hasClaimedSwamp === true);

  const { writeContract: writeClaimSwamp, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      refetchHasClaimed();
    },
  });

  const handleClaimSwamp = () => {
    if (claiming || swampClaimed || !isBadgesAddressValid) return;
    setClaiming(true);
    writeClaimSwamp(
      {
        address: BADGES_CONTRACT_ADDRESS,
        abi: monstroHuntBadgesABI,
        functionName: 'claimSwamp',
        chainId: base.id,
      },
      {
        onSettled: () => {
          setClaiming(false);
          refetchHasClaimed();
        },
      }
    );
  };

  const isClaiming = claiming || isWritePending || isConfirming;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Badges</h2>
      <p className={styles.subtitle}>
        Collect NFT badges (ERC‑1155) for your progress. Swamp is free when you enter the app.
      </p>
      {isBadgesAddressValid && (
        <p className={styles.nftLink}>
          <a href={OPENSEA_BADGES_URL} target="_blank" rel="noopener noreferrer" className={styles.nftLinkA}>
            View on OpenSea
          </a>
        </p>
      )}

      <div className={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const isSwamp = a.id === 'swamp';
          const tokenId = ACHIEVEMENT_IDS[a.id];
          const balance = tokenId !== undefined ? (balances[tokenId] ?? 0n) : 0n;
          const claimed = balance > 0n;
          const unlocked = isSwamp;

          return (
            <div
              key={a.id}
              className={`${styles.card} ${unlocked ? styles.unlocked : ''} ${claimed ? styles.claimed : ''}`}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={a.image}
                  alt={a.name}
                  width={880}
                  height={880}
                  className={styles.badgeImage}
                />
              </div>
              <h3 className={styles.name}>{a.name}</h3>
              <p className={styles.description}>{a.description}</p>
              <p className={styles.condition}>{a.condition}</p>
              {isSwamp && (
                <button
                  type="button"
                  className={`${styles.claimBtn} ${swampClaimed ? styles.claimBtnClaimed : ''}`}
                  onClick={handleClaimSwamp}
                  disabled={isClaiming || swampClaimed || !address || !isBadgesAddressValid}
                >
                  {!isBadgesAddressValid
                    ? 'Badges soon'
                    : isClaiming
                      ? '…'
                      : swampClaimed
                        ? 'Claimed'
                        : !address
                          ? 'Connect wallet'
                          : 'Claim free'}
                </button>
              )}
              {!isSwamp && (
                claimed ? (
                  <span className={styles.claimedLabel}>You have this NFT</span>
                ) : (
                  <span className={styles.lockedLabel}>Unlock in game</span>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
