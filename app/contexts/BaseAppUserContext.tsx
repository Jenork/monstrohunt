'use client';

/**
 * Base App only: exposes current user profile from Mini App context (sdk.context).
 * Used to show the user's Base App avatar when OnchainKit has no avatar.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import sdk from '@farcaster/miniapp-sdk';

export interface BaseAppUserValue {
  /** Profile image URL from Base App; undefined if not in Mini App or not yet loaded. */
  pfpUrl: string | undefined;
  /** Display name from Base App (Farcaster) profile. */
  displayName: string | undefined;
  /** Username from Base App (Farcaster) profile. */
  username: string | undefined;
}

const BaseAppUserContext = createContext<BaseAppUserValue>({
  pfpUrl: undefined,
  displayName: undefined,
  username: undefined,
});

export function useBaseAppUser(): BaseAppUserValue {
  return useContext(BaseAppUserContext);
}

export function BaseAppUserProvider({ children }: { children: ReactNode }) {
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    sdk.context
      .then((ctx) => {
        const u = ctx.user;
        setPfpUrl(u?.pfpUrl ?? undefined);
        setDisplayName(u?.displayName ?? undefined);
        setUsername(u?.username ?? undefined);
      })
      .catch(() => {
        setPfpUrl(undefined);
        setDisplayName(undefined);
        setUsername(undefined);
      });
  }, []);

  const value: BaseAppUserValue = { pfpUrl, displayName, username };
  return (
    <BaseAppUserContext.Provider value={value}>
      {children}
    </BaseAppUserContext.Provider>
  );
}
