'use client';

import styles from './FAQScreen.module.css';

export function FAQScreen() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Frequently Asked Questions</h2>

      <div className={styles.faqList}>
        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I create a monster?</h3>
          <p className={styles.answer}>
            Go to the Create tab, choose an avatar, enter a name, and select a tier: 
            Scout (0.001 ETH), Hunter (0.005 ETH), or Leviathan (0.01 ETH). Then click &quot;Create Monster&quot;.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What happens if I forget to feed my monster?</h3>
          <p className={styles.answer}>
            You must feed your monster regularly to keep it alive. If you don&apos;t feed in time, 
            it becomes starved and other players can hunt it. If hunted, you lose your monster.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How much does feeding cost?</h3>
          <p className={styles.answer}>
            The feed cost is shown in your Profile. Feed on time to keep your monster alive and earning.
            The cost grows as your monster gains weight from rewards.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I earn rewards?</h3>
          <p className={styles.answer}>
            When someone&apos;s monster is hunted, rewards are distributed proportionally among 
            all alive monsters by weight. The heavier your monster, the larger your share.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I hunt other monsters?</h3>
          <p className={styles.answer}>
            Go to the Hunt tab to see starved monsters. Click &quot;Hunt&quot; to claim a reward. 
            Warning: hunting is a race — gas may be lost if someone else hunts first or the owner feeds.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>Can I sell my monster?</h3>
          <p className={styles.answer}>
            Yes. In the Manage tab you can sell any monster that is not starved. 
            You receive your monster&apos;s weight in ETH (minus a small protocol fee).
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What is monster weight?</h3>
          <p className={styles.answer}>
            Weight is the ETH value of your monster: initial deposit plus accumulated rewards.
            Heavier monsters get a larger share of reward distributions.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What are the tiers?</h3>
          <p className={styles.answer}>
            Tier sets the initial cost and weight: Scout 0.001 ETH, Hunter 0.005 ETH, Leviathan 0.01 ETH. 
            Higher tier means higher initial weight and larger reward share, but also higher feed costs.
          </p>
        </div>
      </div>
    </div>
  );
}
