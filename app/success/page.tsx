"use client";

import styles from "./page.module.css";

const APP_NAME = 'MONSTRO HUNT';

export default function Success() {
  const handleShare = async () => {
    const text = `I just joined ${APP_NAME}.`;
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;

    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
        <div className={styles.successMessage}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkCircle}>
              <div className={styles.checkmarkStem}></div>
              <div className={styles.checkmarkKick}></div>
            </div>
          </div>
          
          <h1 className={styles.title}>Welcome to {APP_NAME}!</h1>
          
          <p className={styles.subtitle}>
            You&apos;re in! We&apos;ll notify you as soon as we launch.<br />
            Get ready to experience the future of onchain marketing.
          </p>

          <button onClick={handleShare} className={styles.shareButton}>
            SHARE
          </button>
        </div>
      </div>
    </div>
  );
}
