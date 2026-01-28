'use client';

import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { PanelTabs } from './components/ui/PanelTabs';
import { ToastContainer } from './components/ui/ToastContainer';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { HomeScreen, CreateScreen, ManageScreen, HuntScreen, FAQScreen } from './components/screens';
import { Screen } from './types/screen';
import styles from './page.module.css';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const handleLaunch = () => {
    if (!isConnected && connectors[0]) {
      connect({ connector: connectors[0] });
    }
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
            {currentScreen === 'create' && <CreateScreen />}
            {currentScreen === 'manage' && <ManageScreen />}
            {currentScreen === 'hunt' && <HuntScreen />}
            {currentScreen === 'faq' && <FAQScreen />}
          </div>
        </>
      )}
    </main>
  );
}
