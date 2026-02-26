'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ACHIEVEMENTS } from '../../constants/achievements';
import { BADGES_CONTRACT_ADDRESS, isBadgesAddressValid } from '../../utils/contract';
import { monstroHuntBadgesABI, BADGES_TOKEN_IDS } from '../../contracts/monstroHuntBadges';
import styles from './AchievementsScreen.module.css';

export function AchievementsScreen() {
  const { address } = useAccount();
  const [claiming, setClaiming] = useState(false);

  const { data: swampBalance, refetch: refetchBalance } = useReadContract({
    address: BADGES_CONTRACT_ADDRESS,
    abi: monstroHuntBadgesABI,
    functionName: 'balanceOf',
    args: address ? [address, BigInt(BADGES_TOKEN_IDS.swamp)] : undefined,
    query: { enabled: !!address && isBadgesAddressValid },
  });
  const { data: hasClaimed } = useReadContract({
    address: BADGES_CONTRACT_ADDRESS,
    abi: monstroHuntBadgesABI,
    functionName: 'hasClaimedSwamp',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isBadgesAddressValid },
  });

  const swampClaimed = (swampBalance !== undefined && swampBalance > 0n) || (hasClaimed === true);

  const { writeContract: writeClaimSwamp, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => refetchBalance(),
  });

  const handleClaimSwamp = () => {
    if (claiming || swampClaimed || !isBadgesAddressValid) return;
    setClaiming(true);
    writeClaimSwamp(
      {
        address: BADGES_CONTRACT_ADDRESS,
        abi: monstroHuntBadgesABI,
        functionName: 'claimSwamp',
      },
      {
        onSettled: () => {
          setClaiming(false);
          refetchBalance();
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

      <div className={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const isSwamp = a.id === 'swamp';
          const unlocked = isSwamp; // Swamp is always "unlockable" (free), others will come from contract
          const claimed = isSwamp && swampClaimed;

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
              {!isSwamp && <span className={styles.lockedLabel}>Unlock in game</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
