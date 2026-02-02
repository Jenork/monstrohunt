'use client';

/**
 * TEMPORARY: Connect wallet button for browser mode (MetaMask / injected + WalletConnect).
 * WalletConnect needed for mobile browsers where injected provider is absent.
 * Rendered only in regular browser, never inside Base App.
 */
import { useIsBrowser } from '../../contexts/IsBrowserContext';
import { useConnect } from 'wagmi';

const buttonStyle: React.CSSProperties = {
  padding: '12px 18px',
  minHeight: '44px',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  cursor: 'pointer',
};

export function BrowserConnectButton() {
  const isBrowser = useIsBrowser();
  const { connect, connectors, isPending, pendingConnector } = useConnect();

  if (!isBrowser) return null;

  const injectedConnector = connectors.find((c) => c.type === 'injected');
  const wcConnector = connectors.find((c) => c.type === 'walletConnect');
  const hasMultiple = !!(injectedConnector && wcConnector);

  if (hasMultiple) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => wcConnector && connect({ connector: wcConnector })}
          disabled={isPending}
          style={{
            ...buttonStyle,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {pendingConnector?.type === 'walletConnect' ? 'Connecting...' : 'WalletConnect (mobile)'}
        </button>
        <button
          type="button"
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
          disabled={isPending}
          style={{
            ...buttonStyle,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {pendingConnector?.type === 'injected' ? 'Connecting...' : 'Browser wallet'}
        </button>
      </div>
    );
  }

  const connector = connectors[0];
  return (
    <button
      type="button"
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
      style={{
        ...buttonStyle,
        cursor: isPending || !connector ? 'not-allowed' : 'pointer',
      }}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
