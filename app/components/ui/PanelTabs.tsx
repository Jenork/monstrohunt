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
    { screen: 'manage', label: 'Manage' },
    { screen: 'hunt', label: 'Hunt' },
    { screen: 'achievements', label: 'Badges' },
    { screen: 'faq', label: 'FAQ' },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabsSpacer} aria-hidden />
      <div className={styles.tabsCenter}>
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
      </div>
      <div className={styles.tabsSpacer} aria-hidden />
    </div>
  );
}
