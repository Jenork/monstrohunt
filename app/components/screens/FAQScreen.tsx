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
            Go to the Create tab, choose an avatar, enter a name (max 31 characters), 
            set your deposit amount (minimum 0.0005 ETH), select a feed rate (5% or 10%), 
            and click "Create Monster".
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What happens if I forget to feed my monster?</h3>
          <p className={styles.answer}>
            If you don't feed your monster within 7 days, it becomes huntable. 
            After 7 days + 2 hours grace period, other players can hunt your monster 
            and you may lose it along with your deposit.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I earn rewards?</h3>
          <p className={styles.answer}>
            You earn ETH rewards from fees proportional to your monster's weight. 
            The heavier your monster, the more rewards you receive. Rewards accumulate 
            over time and can be claimed from your Profile.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What's the difference between 5% and 10% feed rate?</h3>
          <p className={styles.answer}>
            The feed rate determines how much ETH you need to feed your monster. 
            5% feed rate costs less but your monster grows slower. 10% feed rate 
            costs more but your monster grows faster, potentially earning more rewards.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I hunt other monsters?</h3>
          <p className={styles.answer}>
            Go to the Hunt tab to see monsters that haven't been fed in 7+ days. 
            Click "Hunt" on any available monster. If successful, you may receive 
            rewards or the monster itself.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>Can I sell my monster?</h3>
          <p className={styles.answer}>
            Yes! In your Profile tab, you can sell any of your monsters. 
            Selling returns your deposit and any accumulated rewards.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What is monster weight?</h3>
          <p className={styles.answer}>
            Monster weight represents the total ETH value associated with your monster, 
            including your deposit and accumulated rewards. Heavier monsters earn 
            proportionally more from fees.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>Is there a minimum deposit?</h3>
          <p className={styles.answer}>
            Yes, the minimum deposit is 0.0005 ETH. You can deposit more if you want 
            to increase your monster's initial weight and potential rewards.
          </p>
        </div>
      </div>
    </div>
  );
}
