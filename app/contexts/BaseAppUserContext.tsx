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
}

const BaseAppUserContext = createContext<BaseAppUserValue>({ pfpUrl: undefined });

export function useBaseAppUser(): BaseAppUserValue {
  return useContext(BaseAppUserContext);
}

export function BaseAppUserProvider({ children }: { children: ReactNode }) {
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    sdk.context
      .then((ctx) => setPfpUrl(ctx.user?.pfpUrl ?? undefined))
      .catch(() => setPfpUrl(undefined));
  }, []);

  const value: BaseAppUserValue = { pfpUrl };
  return (
    <BaseAppUserContext.Provider value={value}>
      {children}
    </BaseAppUserContext.Provider>
  );
}
