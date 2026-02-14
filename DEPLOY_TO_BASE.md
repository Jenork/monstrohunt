# Деплой приложения в Base

Пошаговая инструкция: контракт → фронтенд → открытие в Base App.

---

## 1. Подготовка

### 1.1 Файл `.env`

Создайте `.env` из примера и заполните:

```bash
cp .env.example .env
```

Обязательно укажите в `.env`:

- `PRIVATE_KEY` — приватный ключ кошелька (без `0x`, только 64 символа). **Никому не показывайте и не коммитьте.**
- `BASE_SEPOLIA_RPC_URL=https://sepolia.base.org` — уже есть в примере.
- Для mainnet: `BASE_MAINNET_RPC_URL=https://mainnet.base.org`.

### 1.2 ETH для газа

- **Base Sepolia (тестнет):** возьмите тестовый ETH на [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) или другом faucet для Base Sepolia.
- **Base Mainnet:** на кошельке должен быть реальный ETH для газа.

---

## 2. Деплой смарт-контракта

### Base Sepolia (тестнет, рекомендуется сначала)

```bash
npm run compile
npm run deploy:sepolia
```

В выводе будет строка вида:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

Скопируйте адрес и добавьте в `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...ваш_адрес...
NEXT_PUBLIC_HUNGER_DAYS=1
```

### Base Mainnet (когда всё проверено на Sepolia)

```bash
npm run deploy:mainnet
```

Обновите `.env`: подставьте новый адрес контракта и при необходимости `NEXT_PUBLIC_HUNGER_DAYS=7`.

---

## 3. Деплой фронтенда (Vercel)

Приложение должно быть доступно по публичному URL, чтобы его открывать в Base App.

### Вариант A: через сайт Vercel

1. Залейте проект на GitHub (`git push`).
2. Зайдите на [vercel.com](https://vercel.com) → **Add New Project** → выберите репозиторий.
3. В **Environment Variables** добавьте:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` — адрес задеплоенного контракта.
   - `NEXT_PUBLIC_HUNGER_DAYS` — 1 для Sepolia, 7 для mainnet.
   - При необходимости: `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_URL` (итоговый URL приложения, например `https://ваш-проект.vercel.app`).
4. Нажмите **Deploy**.

### Вариант B: через CLI

```bash
npm i -g vercel
vercel
```

Следуйте подсказкам. Переменные окружения задайте в проекте на vercel.com (Settings → Environment Variables) или при `vercel env add`.

После деплоя запомните URL, например: `https://monstrohunt.vercel.app`.

---

## 4. Открытие и публикация в Base App

1. Убедитесь, что в Vercel задан **production URL** приложения (без префикса `www`, если не используете его).
2. В настройках проекта Vercel при необходимости добавьте переменную:
   - `NEXT_PUBLIC_URL=https://ваш-проект.vercel.app`
   чтобы в манифесте Mini App подставлялся правильный URL.
3. Откройте Base App и перейдите по вашему URL — приложение откроется как Mini App с встроенным кошельком.

### Публикация в Base App (account association + пост)

Чтобы приложение было связано с вашим аккаунтом и его можно было нормально публиковать:

- **Подробная инструкция:** [PUBLISH_MINI_APP_BASE.md](./PUBLISH_MINI_APP_BASE.md)
- Кратко: задеплойте на Vercel → на [base.dev/preview?tab=account](https://www.base.dev/preview?tab=account) введите App URL и получите объект `accountAssociation` → вставьте его в `minikit.config.ts` → запушьте в `main` → проверьте на [base.dev/preview](https://base.dev/preview) → создайте пост в Base App с URL приложения.

---

## 5. Чеклист

- [ ] В `.env` указаны `PRIVATE_KEY`, RPC URL, после деплоя — `NEXT_PUBLIC_CONTRACT_ADDRESS`
- [ ] На кошельке есть ETH для газа (Sepolia или mainnet)
- [ ] Выполнены `npm run compile` и `npm run deploy:sepolia` (или `deploy:mainnet`)
- [ ] В `.env` обновлён адрес контракта и при необходимости `NEXT_PUBLIC_HUNGER_DAYS`
- [ ] Фронтенд задеплоен на Vercel, в настройках заданы переменные окружения
- [ ] Приложение открывается по URL в Base App и кошелёк подключается

Подробнее: [DEPLOYMENT.md](./DEPLOYMENT.md), [GITHUB_VERCEL_DEPLOY.md](./GITHUB_VERCEL_DEPLOY.md).
