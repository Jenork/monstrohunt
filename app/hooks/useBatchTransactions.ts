'use client';

import { useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { encodeFunctionData, type Address } from 'viem';
import { eip5792Actions } from 'viem/experimental';
import { CONTRACT_ADDRESS, monstroHuntABI } from '../utils/contract';
import { getErrorMessage } from '../utils/error';
import { useToast } from './useToast';
import { usePlayerAddress } from './usePlayerAddress';

export interface BatchCall {
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
}

/**
 * Hook for EIP-5792 batch transactions (wallet_sendCalls)
 * Allows sending multiple transactions with a single signature
 * 
 * Benefits:
 * - Single signature for multiple transactions
 * - Better UX (fewer wallet prompts)
 * - Atomic execution option (all succeed or all fail)
 * 
 * @see https://eips.ethereum.org/EIPS/eip-5792
 */
export function useBatchTransactions() {
  const { addToast } = useToast();
  const { isConnected, address } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  /**
   * Send batch of transactions using EIP-5792
   */
  const sendBatch = async (
    calls: BatchCall[],
    options?: { atomic?: boolean }
  ): Promise<{ id: string }> => {
    if (!isConnected || !address) {
      addToast('Wallet not connected', 'error');
      throw new Error('Wallet not connected');
    }

    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id });
    }

    if (!walletClient) {
      addToast('Wallet client not available', 'error');
      throw new Error('Wallet client not available');
    }

    try {
      // Extend wallet client with EIP-5792 actions
      const eip5792Client = walletClient.extend(eip5792Actions());

      // Check if wallet supports EIP-5792
      try {
        const result = await eip5792Client.sendCalls({
          account: address as Address,
          chain: base,
          calls: calls.map((call) => ({
            to: call.to,
            data: call.data,
            value: call.value,
          })),
          capabilities: options?.atomic ? { atomic: { required: true } } : undefined,
        });

        addToast(`Batch transaction sent (${calls.length} calls, 1 signature)`, 'success');
        return result;
      } catch {
        addToast('Batch transactions not supported by wallet, sending sequentially', 'info');
        return await sendSequential(calls, walletClient);
      }
    } catch (error: unknown) {
      addToast(getErrorMessage(error, 'Batch transaction failed'), 'error');
      throw error;
    }
  };

  /**
   * Fallback: send transactions sequentially if EIP-5792 not supported
   */
  const sendSequential = async (
    calls: BatchCall[],
    client: NonNullable<typeof walletClient>
  ): Promise<{ id: string }> => {
    // Send transactions one by one
    // Note: This doesn't provide the same UX benefit, but ensures compatibility
    const results: string[] = [];
    
    for (const call of calls) {
      try {
        const hash = await client.sendTransaction({
          to: call.to,
          data: call.data,
          value: call.value,
        });
        results.push(hash as string);
      } catch (error) {
        throw new Error(`Failed to send transaction: ${getErrorMessage(error, 'Unknown error')}`);
      }
    }

    // Return a combined ID for tracking
    return { id: `sequential-${results.join('-')}` };
  };

  /**
   * Encode contract function call for batch transaction
   */
  const encodeCall = (
    functionName: string,
    args: readonly unknown[],
    value?: bigint
  ): BatchCall => {
    const data = encodeFunctionData({
      abi: monstroHuntABI,
      functionName: functionName as any,
        args: args as never,
    });

    return {
      to: CONTRACT_ADDRESS,
      data,
      value,
    };
  };

  return {
    sendBatch,
    encodeCall,
  };
}
