'use client';

/**
 * Base App only: blocks browser usage and initializes MiniApp provider.
 * Uses both sync (isBaseApp) and async (sdk.isInMiniApp) detection so the app
 * is recognized when opened inside Base App WebView or iframe.
 */
import { useState, useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { isBaseApp } from './lib/isBaseApp';
import { BaseAppProvider } from './browserWalletProvider';

export function WalletProviderGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'unknown' | 'baseapp' | 'browser'>('unknown');

  useEffect(() => {
    if (isBaseApp()) {
      setMode('baseapp');
      return;
    }
    // Async check: Base App may open in WebView where sync check fails
    sdk.isInMiniApp(2500).then((inMiniApp) => {
      setMode(inMiniApp ? 'baseapp' : 'browser');
    }).catch(() => {
      setMode('browser');
    });
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
