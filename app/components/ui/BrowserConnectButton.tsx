'use client';

/**
 * TEMPORARY: Connect wallet button for browser mode (MetaMask / injected).
 * Rendered only in regular browser, never inside Base App.
 * Remove when browser-only testing is removed.
 */
import { useIsBrowser } from '../../contexts/IsBrowserContext';
import { useConnect } from 'wagmi';

export function BrowserConnectButton() {
  const isBrowser = useIsBrowser();
  const { connect, connectors, isPending } = useConnect();

  if (!isBrowser) return null;

  const connector = connectors[0];

  return (
    <button
      type="button"
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
      style={{
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 600,
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.1)',
        color: '#fff',
        cursor: isPending || !connector ? 'not-allowed' : 'pointer',
      }}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
