'use client';

import { useName, useAvatar } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import { formatAddress } from '../../utils/format';
import styles from './AddressProfile.module.css';

interface AddressProfileProps {
  address: string;
  size?: 'default' | 'compact';
  /** If true, show only name (no avatar). Used in Hunt cards. */
  nameOnly?: boolean;
  className?: string;
}

/** Profile: avatar image (or initials) + name (Basename/ENS or short address). Or name only when nameOnly. */
export function AddressProfile({ address, size = 'default', nameOnly = false, className }: AddressProfileProps) {
  const { data: name, isLoading: nameLoading } = useName({ address: address as `0x${string}`, chain: base });
  const { data: avatarUrl } = useAvatar(
    { ensName: name ?? '', chain: base },
    { enabled: !!name }
  );
  const short = formatAddress(address);
  const initials = address.slice(2, 4).toUpperCase();
  const displayName = name || short;

  if (nameOnly) {
    return (
      <span className={`${styles.labelOnly} ${styles[size]} ${className ?? ''}`}>
        {nameLoading ? '…' : displayName}
      </span>
    );
  }

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${className ?? ''}`}>
      <div className={styles.avatar} title={address}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className={styles.avatarImage}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={styles.initials}>{initials}</span>
        )}
      </div>
      <span className={styles.label}>
        {nameLoading ? '…' : displayName}
      </span>
    </div>
  );
}
