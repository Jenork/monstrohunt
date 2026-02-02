'use client';

import { useState } from 'react';
import { usePlayerAddress } from './hooks/usePlayerAddress';
import { PanelTabs } from './components/ui/PanelTabs';
import { ToastContainer } from './components/ui/ToastContainer';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { HomeScreen, CreateScreen, ManageScreen, HuntScreen, FAQScreen } from './components/screens';
import { Screen } from './types/screen';
import styles from './page.module.css';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { isConnected } = usePlayerAddress();

  const handleLaunch = () => {
    setCurrentScreen('create');
  };

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
    </main>
  );
}
