'use client';

import type { Address } from 'viem';
import { formatAddress } from '../../utils/format';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import styles from './AddressProfile.module.css';

interface AddressProfileProps {
  address: Address;
  size?: 'default' | 'compact' | 'small';
  nameOnly?: boolean;
  className?: string;
}

export function AddressProfile({
  address,
  size = 'default',
  nameOnly = false,
  className,
}: AddressProfileProps) {
  const { address: playerAddress } = usePlayerAddress();
  const short = formatAddress(address);
  const initials = address.slice(2, 4).toUpperCase();
  const isCurrentUser = !!(playerAddress && address.toLowerCase() === playerAddress.toLowerCase());
  const displayName = isCurrentUser ? `You (${short})` : short;

  if (nameOnly) {
    return (
      <span className={`${styles.labelOnly} ${styles[size]} ${className ?? ''}`}>
        {displayName}
      </span>
    );
  }

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${className ?? ''}`}>
      <div className={styles.avatar} title={address}>
        <span className={styles.initials}>{initials}</span>
      </div>
      <span className={styles.label}>{displayName}</span>
    </div>
  );
}
