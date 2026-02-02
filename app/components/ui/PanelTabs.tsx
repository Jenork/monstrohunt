'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useToast } from '../../hooks/useToast';
import { Screen } from '../../types/screen';
import { formatAddress } from '../../utils/format';
import { isContractAddressValid } from '../../utils/contract';
import styles from './PanelTabs.module.css';

interface PanelTabsProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function PanelTabs({ currentScreen, onScreenChange }: PanelTabsProps) {
  const { address, isConnected } = usePlayerAddress();
  const { addToast } = useToast();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;
  const networkLabel = chainId
    ? ({
        1: 'Ethereum',
        8453: 'Base',
        84532: 'Base Sepolia',
        11155111: 'Sepolia',
      } as Record<number, string>)[chainId] || `Chain ${chainId}`
    : 'Unknown';

  const tabs: { screen: Screen; label: string }[] = [
    { screen: 'home', label: 'Home' },
    { screen: 'create', label: 'Create' },
    { screen: 'manage', label: 'Manage' },
    { screen: 'hunt', label: 'Hunt' },
    { screen: 'faq', label: 'FAQ' },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabsSpacer} aria-hidden />
      <div className={styles.tabsCenter}>
        <div className={styles.centralColumn}>
          <div className={styles.container}>
            {tabs.map((tab) => (
              <button
                key={tab.screen}
                type="button"
                data-screen={tab.screen}
                className={`${styles.tab} ${currentScreen === tab.screen ? styles.active : ''}`}
                onClick={(e) => {
                  const screen = (e.currentTarget as HTMLButtonElement).getAttribute('data-screen') as Screen | null;
                  if (screen) onScreenChange(screen);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isConnected && address ? (
            <div className={styles.walletWrap}>
              <div className={styles.walletRow}>
                <span className={styles.address}>{formatAddress(address)}</span>
                <span className={styles.networkLabel}>{networkLabel}</span>
              </div>
            </div>
          ) : null}
          {isConnected && (
            <div className={styles.alerts}>
              {!isContractAddressValid && (
                <div className={styles.alert}>
                  Contract address is not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS and redeploy.
                </div>
              )}
              {isWrongNetwork && (
                <div className={styles.alert}>
                  Wrong network. Please switch to Base Sepolia.
                  <button
                    type="button"
                    className={styles.switchButton}
                    onClick={() =>
                      switchChainAsync({ chainId: baseSepolia.id }).catch((e) => {
                        const msg =
                          e instanceof Error
                            ? e.message
                            : 'Network switch was cancelled or failed';
                        addToast(msg, 'error');
                      })
                    }
                    disabled={isSwitching}
                  >
                    {isSwitching ? 'Switching…' : 'Switch network now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.tabsSpacer} aria-hidden />
    </div>
  );
}
