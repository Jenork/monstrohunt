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
import { ToastProvider } from './contexts/ToastContext';

export function WalletProviderGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'unknown' | 'baseapp' | 'browser'>('unknown');

  useEffect(() => {
    if (isBaseApp()) {
      setMode('baseapp');
      return;
    }
    // Async check: Base App context can be ready with delay on first load
    const runCheck = (timeoutMs: number) =>
      sdk.isInMiniApp(timeoutMs).then((inMiniApp) => !!inMiniApp).catch(() => false);

    runCheck(4000).then((firstIsBaseApp) => {
      if (firstIsBaseApp) {
        setMode('baseapp');
        return;
      }
      // Retry once after delay (context often appears late on first open)
      const t = setTimeout(() => {
        runCheck(3000).then((retryIsBaseApp) => {
          setMode(retryIsBaseApp ? 'baseapp' : 'browser');
        });
      }, 1000);
      return () => clearTimeout(t);
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

  return (
    <BaseAppProvider>
      <ToastProvider>{children}</ToastProvider>
    </BaseAppProvider>
  );
}
