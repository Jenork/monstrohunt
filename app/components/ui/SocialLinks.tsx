'use client';

import { TELEGRAM_URL, TWITTER_URL } from '../../constants/social';
import styles from './SocialLinks.module.css';

export function SocialLinks() {
  return (
    <div className={styles.wrapper}>
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-label="Telegram"
      >
        <span className={styles.icon} aria-hidden>TG</span>
        <span>Telegram</span>
      </a>
      <a
        href={TWITTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-label="Twitter / X"
      >
        <span className={styles.icon} aria-hidden>𝕏</span>
        <span>Twitter</span>
      </a>
    </div>
  );
}
