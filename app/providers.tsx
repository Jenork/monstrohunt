'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, createStorage, cookieStorage, http, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';
import { useMemo, useState } from 'react';
import { PlayerAddressProvider } from './contexts/PlayerAddressContext';
import { ToastProvider } from './contexts/ToastContext';

const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    baseAccount({
      appName: 'Monstro Hunt',
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

function WalletAddressProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const value = useMemo(
    () => ({
      address: address ?? undefined,
      isConnected: isConnected && !!address,
      disconnect: null,
    }),
    [address, isConnected]
  );

  return <PlayerAddressProvider value={value}>{children}</PlayerAddressProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WalletAddressProvider>{children}</WalletAddressProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
