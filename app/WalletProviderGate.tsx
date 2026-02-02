'use client';

/**
 * TEMPORARY: Chooses browser vs Base App mode (Connect/Disconnect visibility only).
 * Uses single wagmi provider for both; no OnchainKit in client bundle.
 */
import { useState, useEffect } from 'react';
import { isBaseApp } from './lib/isBaseApp';
import { BrowserWalletProvider } from './browserWalletProvider';

export function WalletProviderGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'unknown' | 'baseapp' | 'browser'>('unknown');

  useEffect(() => {
    setMode(isBaseApp() ? 'baseapp' : 'browser');
  }, []);

  if (mode === 'unknown') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserWalletProvider isBrowser={mode === 'browser'}>
      {children}
    </BrowserWalletProvider>
  );
}
