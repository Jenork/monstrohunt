'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useToast } from '../../hooks/useToast';
import { isContractAddressValid } from '../../utils/contract';
import { AddressProfile } from './AddressProfile';
import styles from './WalletCorner.module.css';

export function WalletCorner() {
  const { address, isConnected } = usePlayerAddress();
  const { addToast } = useToast();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== base.id;
  const networkLabel = chainId
    ? ({
        1: 'Ethereum',
        8453: 'Base',
        84532: 'Base Sepolia',
        11155111: 'Sepolia',
      } as Record<number, string>)[chainId] || `Chain ${chainId}`
    : 'Unknown';

  return (
    <div className={styles.wrapper}>
      {isConnected && address ? (
        <div className={styles.walletRow}>
          <AddressProfile address={address} />
          <span className={styles.networkLabel}>{networkLabel}</span>
        </div>
      ) : null}
      {isConnected && (
        <div className={styles.alerts}>
          {!isContractAddressValid && (
            <div className={styles.alert}>
              Contract address is not configured.
            </div>
          )}
          {isWrongNetwork && (
            <div className={styles.alert}>
              Wrong network.
              <button
                type="button"
                className={styles.switchButton}
                onClick={() =>
                  switchChainAsync({ chainId: base.id }).catch((e) => {
                    const msg =
                      e instanceof Error
                        ? e.message
                        : 'Network switch was cancelled or failed';
                    addToast(msg, 'error');
                  })
                }
                disabled={isSwitching}
              >
                {isSwitching ? '…' : 'Switch to Base'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
