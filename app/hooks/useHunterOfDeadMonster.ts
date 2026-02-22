'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';

/**
 * When monster is dead, fetches the hunter address from the last MonsterHunted event.
 */
export function useHunterOfDeadMonster(monsterId: number, enabled: boolean): string | null {
  const client = usePublicClient({ chainId: base.id });
  const [hunter, setHunter] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !client || !isContractAddressValid || monsterId <= 0) {
      setHunter(null);
      return;
    }
    let cancelled = false;
    client
      .getContractEvents({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        eventName: 'MonsterHunted',
        args: { monsterId: BigInt(monsterId) },
      })
      .then((events) => {
        if (cancelled) return;
        const last = events.length > 0 ? events[events.length - 1] : null;
        setHunter(last?.args?.hunter ?? null);
      })
      .catch(() => setHunter(null));
    return () => {
      cancelled = true;
    };
  }, [client, enabled, monsterId]);

  return hunter;
}
