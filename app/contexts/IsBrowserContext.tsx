'use client';

/**
 * TEMPORARY: True when app is running in a regular browser (wagmi/RainbowKit path).
 * Used to show Connect/Disconnect only in browser, never in Base App.
 */
import { createContext, useContext } from 'react';

const IsBrowserContext = createContext<boolean>(false);

export function useIsBrowser(): boolean {
  return useContext(IsBrowserContext);
}

export function IsBrowserProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return (
    <IsBrowserContext.Provider value={value}>
      {children}
    </IsBrowserContext.Provider>
  );
}
