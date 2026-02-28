'use client';

/**
 * Base App only: uses farcasterMiniApp connector for proper Base Account integration.
 * Uses sdk.wallet.getEthereumProvider() — required for transaction generation in Base App.
 */
import { useState, useMemo, useEffect } from 'react';
import { WagmiProvider, useAccount, createConfig, http, useConnect } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import sdk from '@farcaster/miniapp-sdk';
import { PlayerAddressProvider } from './contexts/PlayerAddressContext';
import { BaseAppUserProvider } from './contexts/BaseAppUserContext';

const config = createConfig({
  chains: [base],
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: http(),
  },
});

function MiniAppReady() {
  useEffect(() => {
    sdk.actions.ready().catch(() => undefined);
  }, []);
  return null;
}

function WalletAddressInjector({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  useEffect(() => {
    if (isConnected || autoConnectAttempted) return;
    const connector = connectors[0];
    if (!connector) return;
    setAutoConnectAttempted(true);
    connectAsync({ connector }).catch(() => undefined);
  }, [isConnected, autoConnectAttempted, connectors, connectAsync]);

  const value = useMemo(
    () => ({
      address: address ?? undefined,
      isConnected: isConnected && !!address,
      disconnect: null,
    }),
    [address, isConnected]
  );
  return (
    <BaseAppUserProvider>
      <PlayerAddressProvider value={value}>{children}</PlayerAddressProvider>
    </BaseAppUserProvider>
  );
}

export function BaseAppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniAppReady />
        <WalletAddressInjector>{children}</WalletAddressInjector>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
