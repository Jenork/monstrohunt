'use client';

import { useQuery } from '@tanstack/react-query';

export interface FarcasterProfile {
  displayName: string | null;
  username: string | null;
}

async function fetchProfile(address: string): Promise<FarcasterProfile> {
  const params = new URLSearchParams({ address: address.toLowerCase() });
  const res = await fetch(`/api/profile?${params}`);
  if (!res.ok) return { displayName: null, username: null };
  const data = await res.json();
  return {
    displayName: data.displayName ?? null,
    username: data.username ?? null,
  };
}

/**
 * Fetches Farcaster/Base App profile (display name, username) for the given address.
 * Uses /api/profile which calls Neynar when NEYNAR_API_KEY is set.
 */
export function useFarcasterProfile(address: string | undefined) {
  const { data } = useQuery({
    queryKey: ['farcasterProfile', address?.toLowerCase()],
    queryFn: () => fetchProfile(address!),
    enabled: !!address && /^0x[a-fA-F0-9]{40}$/.test(address),
    staleTime: 5 * 60 * 1000, // 5 min
  });
  return data ?? { displayName: null, username: null };
}
