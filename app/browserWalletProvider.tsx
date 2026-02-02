'use client';

/**
 * TEMPORARY: Wallet support for testnet (browser + Base App).
 * Uses wagmi only (no OnchainKit in client bundle — avoids Node-only deps like http2).
 * isBrowser controls Connect/Disconnect button visibility. Remove when browser testing is removed.
 */
import { useState, useMemo } from 'react';
import { WagmiProvider, useAccount, useDisconnect, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlayerAddressProvider } from './contexts/PlayerAddressContext';
import { IsBrowserProvider } from './contexts/IsBrowserContext';

const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
  },
});

function WalletAddressInjector({
  children,
  isBrowser,
}: {
  children: React.ReactNode;
  isBrowser: boolean;
}) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const value = useMemo(
    () => ({
      address: address ?? undefined,
      isConnected: isConnected && !!address,
      disconnect: isBrowser ? () => disconnect() : null,
    }),
    [address, isConnected, disconnect, isBrowser]
  );
  return <PlayerAddressProvider value={value}>{children}</PlayerAddressProvider>;
}

export function BrowserWalletProvider({
  children,
  isBrowser,
}: {
  children: React.ReactNode;
  isBrowser: boolean;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <IsBrowserProvider value={isBrowser}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <WalletAddressInjector isBrowser={isBrowser}>{children}</WalletAddressInjector>
        </QueryClientProvider>
      </WagmiProvider>
    </IsBrowserProvider>
  );
}
