'use client';

import { useState, useCallback } from 'react';
import { usePlayerAddress } from './hooks/usePlayerAddress';
import { PanelTabs } from './components/ui/PanelTabs';
import { SocialLinks } from './components/ui/SocialLinks';
import { ToastContainer } from './components/ui/ToastContainer';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { HomeScreen, CreateScreen, ManageScreen, HuntScreen, FAQScreen } from './components/screens';
import { Screen } from './types/screen';
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

  const setCurrentScreen = useCallback((screen: Screen) => {
    setCurrentScreenState(screen);
    if (typeof window !== 'undefined') sessionStorage.setItem(STORAGE_KEY, screen);
  }, []);

  const handleLaunch = useCallback(() => {
    setCurrentScreen('create');
  }, [setCurrentScreen]);

  return (
    <main className={styles.main}>
      <ToastContainer />
      <BackgroundMusic />
      
      {currentScreen === 'home' ? (
        <HomeScreen onLaunch={handleLaunch} />
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
