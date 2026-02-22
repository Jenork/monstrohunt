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
          <h3 className={styles.question}>How many monsters can I have?</h3>
          <p className={styles.answer}>
            One monster per wallet. The contract enforces this: you can only create a new monster if you don&apos;t already own one.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What happens if I forget to feed my monster?</h3>
          <p className={styles.answer}>
            You must feed your monster before the hunger deadline (see Manage tab). If you don&apos;t feed in time, 
            it becomes starved and other players can hunt it. If hunted, you lose your monster.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How much does feeding cost?</h3>
          <p className={styles.answer}>
            The feed cost is shown in your Profile (Manage tab). Formula: <strong>5% of initial weight + 5% of current weight</strong>. 
            The full amount you pay goes into your monster&apos;s weight (no protocol fee on feeding). 
            Feed on time to keep your monster alive. The cost grows as your monster gains weight from rewards.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I earn rewards?</h3>
          <p className={styles.answer}>
            When a monster is hunted, its weight is split: <strong>30% to the hunter</strong>, <strong>65% distributed to all alive monsters</strong> (by weight share), <strong>5% to the protocol</strong>. The heavier your monster, the larger your share of the 65%.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>How do I hunt other monsters?</h3>
          <p className={styles.answer}>
            Go to the Hunt tab to see starved monsters. Click &quot;Hunt&quot; to claim a reward. You receive <strong>30% of the target&apos;s weight</strong>. After each hunt attempt you have a 20-minute cooldown before you can hunt again.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>What are the risks?</h3>
          <p className={styles.answer}>
            If you don&apos;t feed your monster in time, it becomes starved and can be hunted by others — you lose the monster.
            When hunting: the attempt can fail if the target is fed before your transaction confirms; gas fees are still charged.
            Hunting is a race — if someone else hunts first or the owner feeds in time, you may pay gas without getting a reward.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.question}>Can I sell my monster?</h3>
          <p className={styles.answer}>
            Yes. In the Manage tab you can sell any monster that is not starved. 
            You receive <strong>99% of your monster&apos;s weight</strong> in ETH; <strong>1% goes to the protocol</strong>.
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
