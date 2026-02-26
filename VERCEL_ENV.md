# 4. Что прописать на проде (Vercel и т.п.)

В **Vercel** (или другом хостинге): проект → **Settings** → **Environment Variables**. Добавь переменные ниже и сделай **Redeploy**, чтобы они подхватились.

---

## Обязательные

| Переменная | Значение | Зачем |
|------------|----------|--------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x3A52Fd151Aa9501c7BDB50C0247caA8607B18711` | Адрес игрового контракта MonstroHunt на Base Mainnet. Без него игра не работает. |
| `NEXT_PUBLIC_HUNGER_DAYS` | `3` | Длительность голода в днях (должна совпадать с контрактом). |

---

## Рекомендуемые

| Переменная | Значение | Зачем |
|------------|----------|--------|
| `NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS` | `0x44065694ac7bbb0e672f8Eb0317DAB8fF5995456` | Контракт NFT-бейджей (ERC-1155). Без него вкладка Badges показывает «Badges soon» и минт Swamp недоступен. |
| `NEXT_PUBLIC_URL` | Твой production URL, например `https://monstrohunt.vercel.app` | Нужен для auth (Base App / Farcaster) и для success-страницы. Без него возможны проблемы с верификацией в Base App. |

---

## По желанию

| Переменная | Значение | Зачем |
|------------|----------|--------|
| `NEYNAR_API_KEY` | Ключ с [neynar.com](https://neynar.com) | Показ имён профилей Farcaster/Base в карточках Hunt. Без ключа показывается короткий адрес. |
| `NEXT_PUBLIC_TELEGRAM_URL` | `https://t.me/monstrohunt` | Ссылка в футере (по умолчанию уже стоит в коде). |
| `NEXT_PUBLIC_TWITTER_URL` | `https://x.com/super_jenork` | Ссылка в футере (по умолчанию уже стоит в коде). |
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | Ключ OnchainKit (если используешь) | Для расширенных фич OnchainKit; приложение может работать и без него. |

---

## Кратко

**Минимум для работы игры на проде:**

1. `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0x3A52Fd151Aa9501c7BDB50C0247caA8607B18711`
2. `NEXT_PUBLIC_HUNGER_DAYS` = `3`

**Чтобы работали бейджи (Claim free Swamp):**

3. `NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS` = `0x44065694ac7bbb0e672f8Eb0317DAB8fF5995456`

**Чтобы Base App / Farcaster auth работал стабильно:**

4. `NEXT_PUBLIC_URL` = твой прод-URL (например `https://твой-проект.vercel.app`).

После добавления или изменения переменных: **Deployments** → у последнего деплоя **…** → **Redeploy**.
