'use client';

import { useState, useCallback, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { usePlayerAddress } from './hooks/usePlayerAddress';
import { PanelTabs } from './components/ui/PanelTabs';
import { SocialLinks } from './components/ui/SocialLinks';
import { WalletCorner } from './components/ui/WalletCorner';
import { HistoryButton } from './components/ui/HistoryButton';
import { AddressProfile } from './components/ui/AddressProfile';
import { ToastContainer } from './components/ui/ToastContainer';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { HomeScreen } from './components/screens';
import dynamic from 'next/dynamic';

// Lazy load screens for better performance (code splitting)
const CreateScreen = dynamic(() => import('./components/screens').then(mod => ({ default: mod.CreateScreen })), { 
  ssr: false,
  loading: () => <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>
});
const ManageScreen = dynamic(() => import('./components/screens').then(mod => ({ default: mod.ManageScreen })), { 
  ssr: false,
  loading: () => <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>
});
const HuntScreen = dynamic(() => import('./components/screens').then(mod => ({ default: mod.HuntScreen })), { 
  ssr: false,
  loading: () => <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>
});
const FAQScreen = dynamic(() => import('./components/screens').then(mod => ({ default: mod.FAQScreen })), { 
  ssr: false,
  loading: () => <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>
});
import { Screen } from './types/screen';
import { isContractAddressValid } from './utils/contract';
import styles from './page.module.css';

const STORAGE_KEY = 'monstro-screen';

function getStoredScreen(): Screen {
  if (typeof window === 'undefined') return 'home';
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === 'home' || stored === 'create' || stored === 'manage' || stored === 'hunt' || stored === 'faq') return stored;
  return 'home';
}

export default function Home() {
  const [currentScreen, setCurrentScreenState] = useState<Screen>(getStoredScreen);
  const { isConnected, address } = usePlayerAddress();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false);

  const setCurrentScreen = useCallback((screen: Screen) => {
    setCurrentScreenState(screen);
    if (typeof window !== 'undefined') sessionStorage.setItem(STORAGE_KEY, screen);
  }, []);

  const handleLaunch = useCallback(() => {
    setCurrentScreen('create');
  }, [setCurrentScreen]);

  useEffect(() => {
    if (!isConnected) return;
    if (chainId === base.id) {
      if (autoSwitchAttempted) setAutoSwitchAttempted(false);
      return;
    }
    if (autoSwitchAttempted) return;
    setAutoSwitchAttempted(true);
    switchChainAsync({ chainId: base.id }).catch(() => {
      // User rejected or wallet doesn't support auto switching.
    });
  }, [isConnected, chainId, autoSwitchAttempted, switchChainAsync]);

  if (!isContractAddressValid) {
    return (
      <main className={styles.main}>
        <div className={styles.blocker}>
          Contract address is not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS and redeploy.
        </div>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}><SocialLinks /></div>
          <div className={styles.topBarCenter} />
          <div className={styles.topBarRight}>
            <HistoryButton />
            <WalletCorner showProfile={false} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <ToastContainer />
      <BackgroundMusic />

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}><SocialLinks /></div>
        <div className={styles.topBarCenter}>
          {isConnected && address ? <AddressProfile address={address} /> : null}
        </div>
        <div className={styles.topBarRight}>
          <HistoryButton />
          <WalletCorner showProfile={false} />
        </div>
      </div>

      {currentScreen === 'home' ? (
        <HomeScreen
          onLaunch={handleLaunch}
          warning={
            isConnected && chainId !== base.id
              ? 'Wrong network. Please switch to Base.'
              : undefined
          }
        />
      ) : (
        <>
          <PanelTabs currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
          <div className={styles.content}>
            <div className={styles.contentInner}>
              <div className={styles.centeredContent} data-screen={currentScreen}>
                {currentScreen === 'create' && (
                  <CreateScreen onCreated={() => setCurrentScreen('manage')} />
                )}
                {currentScreen === 'manage' && <ManageScreen />}
                {currentScreen === 'hunt' && <HuntScreen />}
                {currentScreen === 'faq' && <FAQScreen />}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
