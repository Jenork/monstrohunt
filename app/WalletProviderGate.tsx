'use client';

/**
 * Base App only: blocks browser usage and initializes MiniApp provider.
 */
import { useState, useEffect } from 'react';
import { isBaseApp } from './lib/isBaseApp';
import { BaseAppProvider } from './browserWalletProvider';

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

  if (mode === 'browser') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        Open this app inside Base App.
      </div>
    );
  }

  return <BaseAppProvider>{children}</BaseAppProvider>;
}
