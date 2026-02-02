'use client';

import { usePlayerAddress } from '../../hooks/usePlayerAddress';
import { useIsBrowser } from '../../contexts/IsBrowserContext';
import { Screen } from '../../types/screen';
import { formatAddress } from '../../utils/format';
import { BrowserConnectButton } from './BrowserConnectButton';
import styles from './PanelTabs.module.css';

interface PanelTabsProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function PanelTabs({ currentScreen, onScreenChange }: PanelTabsProps) {
  const { address, isConnected, disconnect } = usePlayerAddress();
  const isBrowser = useIsBrowser();

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
          {(isBrowser && !isConnected) || (isConnected && address) ? (
            <div className={styles.walletWrap}>
              {isBrowser && !isConnected && <BrowserConnectButton />}
              {isConnected && address && (
                <div className={styles.walletRow}>
                  <span className={styles.address}>{formatAddress(address)}</span>
                  {isBrowser && disconnect && (
                    <button
                      type="button"
                      className={styles.disconnectButton}
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.tabsSpacer} aria-hidden />
    </div>
  );
}
