'use client';

import { useName, useAvatar } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { formatAddress } from '../../utils/format';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useBaseAppUser } from '../../contexts/BaseAppUserContext';
import styles from './AddressProfile.module.css';

const DEFAULT_AVATAR_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23155DFD"/><circle cx="50" cy="38" r="18" fill="white"/><path d="M20 95c0-16.5 13.5-30 30-30s30 13.5 30 30" fill="white"/></svg>'
)}`;

interface AddressProfileProps {
  address: string;
  size?: 'default' | 'compact' | 'small';
  /** If true, show only name (no avatar). Used in Hunt cards. */
  nameOnly?: boolean;
  className?: string;
}

/** Profile: avatar image (or initials) + name (Basename/ENS or short address). Or name only when nameOnly. */
export function AddressProfile({ address, size = 'default', nameOnly = false, className }: AddressProfileProps) {
  const { address: playerAddress } = usePlayerAddress();
  const { pfpUrl: baseAppPfpUrl } = useBaseAppUser();
  const { data: name, isLoading: nameLoading } = useName({ address: address as `0x${string}`, chain: base });
  const { data: avatarUrl } = useAvatar(
    { ensName: name ?? '', chain: base },
    { enabled: !!name }
  );
  const short = formatAddress(address);
  const initials = address.slice(2, 4).toUpperCase();
  const displayName = name || short;
  const isCurrentUser = playerAddress && address.toLowerCase() === playerAddress.toLowerCase();
  // For current user, prefer Base App profile avatar so it isn't replaced by OnchainKit default
  const imgSrc =
    isCurrentUser && baseAppPfpUrl
      ? baseAppPfpUrl
      : avatarUrl ?? (name ? DEFAULT_AVATAR_SVG : null);

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
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className={styles.avatarImage}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <span className={styles.initials} style={imgSrc ? { display: 'none' } : undefined}>
          {initials}
        </span>
      </div>
      <span className={styles.label}>
        {nameLoading ? '…' : displayName}
      </span>
    </div>
  );
}
