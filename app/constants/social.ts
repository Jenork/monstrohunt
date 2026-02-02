/**
 * Ссылки на соцсети игры. Задаются через .env:
 * NEXT_PUBLIC_TELEGRAM_URL, NEXT_PUBLIC_TWITTER_URL
 */
export const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/monstrohunt';
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/super_jenork';
