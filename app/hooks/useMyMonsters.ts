'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';

export function useMyMonsters() {
  const { address } = useAccount();
  
  const { data: monsterId, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: monstroHuntABI,
    functionName: 'getOwnerMonsterId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Return array format for compatibility, but only one monster per wallet
  const monsterIds = monsterId && monsterId > 0n ? [monsterId] : [];
  
  return { monsterIds: monsterIds.map(id => Number(id)), refetch };
}
