'use client';

import { Identity, Avatar, Name } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import styles from './AddressProfile.module.css';

interface AddressProfileProps {
  address: string;
  size?: 'default' | 'compact';
  className?: string;
}

/** Profile block: avatar + name (Basename/ENS or short address fallback). */
export function AddressProfile({ address, size = 'default', className }: AddressProfileProps) {
  return (
    <Identity
      address={address as `0x${string}`}
      chain={base}
      className={`${styles.wrapper} ${styles[size]} ${className ?? ''}`}
    >
      <Avatar address={address as `0x${string}`} chain={base} className={styles.ockAvatar} />
      <Name address={address as `0x${string}`} chain={base} className={styles.ockName} />
    </Identity>
  );
}
