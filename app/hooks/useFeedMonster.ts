'use client';

import { useEffect } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useConnect,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { CONTRACT_ADDRESS, isContractAddressValid, monstroHuntABI } from '../utils/contract';
import { getErrorMessage } from '../utils/error';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';
import { useBatchTransactions } from './useBatchTransactions';

export function useFeedMonster() {
  const { addToast } = useToast();
  const { isConnected } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isPending: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { sendBatch, encodeCall } = useBatchTransactions();

  useEffect(() => {
    if (error?.message) {
      addToast(error.message, 'error');
    }
  }, [error?.message, addToast]);

  /**
   * Feed monster (single transaction)
   */
  const feedMonster = async (monsterId: number, feedCost: bigint) => {
    if (!isConnected) {
      const connector = connectors[0];
      if (!connector) {
        addToast('No wallet connector available', 'error');
        return;
      }
      try {
        addToast('Connecting wallet...', 'info');
        await connectAsync({ connector });
      } catch (e: unknown) {
        addToast(getErrorMessage(e, 'Wallet connection failed'), 'error');
        return;
      }
    }
    if (!isContractAddressValid) {
      addToast('Contract address is not configured', 'error');
      return;
    }
    if (monsterId <= 0) {
      addToast('Invalid monster', 'error');
      return;
    }
    if (feedCost <= 0n) {
      addToast('Invalid feed cost', 'error');
      return;
    }
    try {
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'feedMonster',
        args: [BigInt(monsterId)],
        value: feedCost,
        chainId: base.id,
      });
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Switch to Base or try again'), 'error');
    }
  };

  /**
   * Feed monster multiple times in a batch (EIP-5792)
   * Useful when user wants to feed multiple times with a single signature
   * 
   * @param monsterId Monster ID to feed
   * @param feedCosts Array of feed costs (each feed will use the cost at that moment)
   * @note Feed costs may change between feeds, so this is best used when costs are similar
   */
  const feedMonsterBatch = async (monsterId: number, feedCosts: bigint[]) => {
    if (!isConnected) {
      const connector = connectors[0];
      if (!connector) {
        addToast('No wallet connector available', 'error');
        return;
      }
      try {
        addToast('Connecting wallet...', 'info');
        await connectAsync({ connector });
      } catch (e: unknown) {
        addToast(getErrorMessage(e, 'Wallet connection failed'), 'error');
        return;
      }
    }
    if (!isContractAddressValid) {
      addToast('Contract address is not configured', 'error');
      return;
    }
    if (monsterId <= 0) {
      addToast('Invalid monster', 'error');
      return;
    }
    if (feedCosts.length === 0) {
      addToast('No feed costs provided', 'error');
      return;
    }
    if (feedCosts.some(cost => cost <= 0n)) {
      addToast('Invalid feed cost', 'error');
      return;
    }

    try {
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }

      // Create batch calls for multiple feeds
      const calls = feedCosts.map(cost => 
        encodeCall('feedMonster', [BigInt(monsterId)], cost)
      );

      await sendBatch(calls, { atomic: false }); // Not atomic - each feed can succeed independently
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Batch feed failed'), 'error');
    }
  };

  return {
    feedMonster,
    feedMonsterBatch,
    isPending: isSwitchingChain || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
