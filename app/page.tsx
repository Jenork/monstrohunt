'use client';

import { useState, useCallback, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { usePlayerAddress } from './hooks/usePlayerAddress';
import { PanelTabs } from './components/ui/PanelTabs';
import { SocialLinks } from './components/ui/SocialLinks';
import { ToastContainer } from './components/ui/ToastContainer';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { HomeScreen, CreateScreen, ManageScreen, HuntScreen, FAQScreen } from './components/screens';
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
  const { isConnected } = usePlayerAddress();
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
        <SocialLinks />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <ToastContainer />
      <BackgroundMusic />
      
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
      <SocialLinks />
    </main>
  );
}
