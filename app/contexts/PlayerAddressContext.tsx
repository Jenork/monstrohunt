'use client';

/**
 * TEMPORARY: Unified wallet address for Base App (MiniKit) and browser (wagmi).
 * All UI and contract logic must use usePlayerAddress only.
 * Remove when browser-only testing is removed.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { Address } from 'viem';

export interface PlayerAddressValue {
  address: Address | undefined;
  isConnected: boolean;
  disconnect: (() => void) | null;
}

const PlayerAddressContext = createContext<PlayerAddressValue>({
  address: undefined,
  isConnected: false,
  disconnect: null,
});

export function usePlayerAddress(): PlayerAddressValue {
  const ctx = useContext(PlayerAddressContext);
  if (!ctx) {
    return { address: undefined, isConnected: false, disconnect: null };
  }
  return ctx;
}

export function PlayerAddressProvider({
  value,
  children,
}: {
  value: PlayerAddressValue;
  children: ReactNode;
}) {
  return (
    <PlayerAddressContext.Provider value={value}>
      {children}
    </PlayerAddressContext.Provider>
  );
}
