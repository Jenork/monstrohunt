'use client';

import { Providers } from './providers';

export function WalletProviderGate({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
