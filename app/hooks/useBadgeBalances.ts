'use client';

import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { BADGES_CONTRACT_ADDRESS, isBadgesAddressValid } from '../utils/contract';
import { monstroHuntBadgesABI, BADGES_TOKEN_IDS } from '../contracts/monstroHuntBadges';
import { usePlayerAddress } from './usePlayerAddress';

const TOKEN_IDS = Object.values(BADGES_TOKEN_IDS);

interface BadgeBalancesResult {
  balances: Record<number, bigint>;
  refetch: () => Promise<unknown>;
}

/**
 * Returns balance for each badge token ID (1–6) for the connected address.
 */
export function useBadgeBalances(): BadgeBalancesResult {
  const { address } = usePlayerAddress();
  const enabled = !!address && isBadgesAddressValid;

  const contracts = useMemo(
    () =>
      TOKEN_IDS.map((id) => ({
        address: BADGES_CONTRACT_ADDRESS,
        abi: monstroHuntBadgesABI,
        functionName: 'balanceOf' as const,
        args: [(address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`, BigInt(id)] as const,
      })),
    [address]
  );

  const { data, refetch } = useReadContracts({
    contracts,
    query: { enabled },
  });

  const balances: Record<number, bigint> = {};
  if (data) {
    TOKEN_IDS.forEach((id, i) => {
      const result = data[i];
      balances[id] = result?.status === 'success' && result.result !== undefined ? (result.result as bigint) : 0n;
    });
  } else {
    TOKEN_IDS.forEach((id) => { balances[id] = 0n; });
  }
  return { balances, refetch };
}
