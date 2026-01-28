'use client';

import { Screen } from '../../types/screen';
import styles from './PanelTabs.module.css';

interface PanelTabsProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function PanelTabs({ currentScreen, onScreenChange }: PanelTabsProps) {
  const tabs: { screen: Screen; label: string }[] = [
    { screen: 'home', label: 'Home' },
    { screen: 'create', label: 'Create' },
    { screen: 'manage', label: 'Profile' },
    { screen: 'hunt', label: 'Hunt' },
    { screen: 'faq', label: 'FAQ' },
  ];

  return (
    <div className={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.screen}
          className={`${styles.tab} ${currentScreen === tab.screen ? styles.active : ''}`}
          onClick={() => onScreenChange(tab.screen)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
