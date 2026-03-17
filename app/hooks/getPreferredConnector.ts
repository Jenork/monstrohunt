'use client';

import type { Connector } from 'wagmi';

export function getPreferredConnector(connectors: readonly Connector[]) {
  const injectedConnector = connectors.find((connector) => connector.id === 'injected');
  const baseAccountConnector = connectors.find((connector) => connector.id === 'baseAccount');

  if (typeof window !== 'undefined' && 'ethereum' in window && injectedConnector) {
    return injectedConnector;
  }

  return baseAccountConnector ?? injectedConnector ?? connectors[0];
}
