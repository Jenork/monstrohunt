# Пошаговая инструкция: MONSTROHUNT

Один документ: **локальный запуск → деплой контракта → деплой фронта → публикация в Base App**.

---

## Часть 1. Подготовка

### 1.1 Требования

- **Node.js** 18+ (рекомендуется 20.x)
- **Git**
- Кошелёк с **приватным ключом** (для деплоя контракта)
- **ETH** на Base Sepolia (тестнет) или Base Mainnet для газа

### 1.2 Клонирование / переход в проект

```bash
cd C:\MonstroHuntTemp
```

(или путь к папке проекта)

### 1.3 Установка зависимостей

```bash
npm install
```

Если будут конфликты peer dependencies:

```bash
npm install --legacy-peer-deps
```

### 1.4 Файл окружения

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

| Переменная | Описание |
|------------|----------|
| `PRIVATE_KEY` | Приватный ключ кошелька (64 символа, без `0x`). **Не коммитить!** |
| `BASE_SEPOLIA_RPC_URL` | Уже в примере: `https://sepolia.base.org` |
| `BASE_MAINNET_RPC_URL` | Уже в примере: `https://mainnet.base.org` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Пока оставьте `0x000...` — подставите после деплоя контракта |
| `NEXT_PUBLIC_HUNGER_DAYS` | `1` для Base Sepolia, `7` для mainnet |
| `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_TWITTER_URL` | По желанию |

Опционально для OnchainKit: `NEXT_PUBLIC_ONCHAINKIT_API_KEY`.

---

## Часть 2. Локальный запуск

### 2.1 Компиляция контракта (нужна для деплоя, для dev можно пропустить)

```bash
npm run compile
```

Должно завершиться без ошибок.

### 2.2 Запуск dev-сервера

```bash
npm run dev
```

Сервер: **http://localhost:3000**

### 2.3 Что увидите

- В обычном браузере по localhost отобразится сообщение **«Open this app inside Base App»** — так и задумано.
- Игра с кошельком работает только при открытии **задеплоенного URL внутри Base App**.

Локальный запуск нужен для разработки и проверки сборки.

---

## Часть 3. Деплой смарт-контракта

### 3.1 ETH для газа

- **Base Sepolia (тестнет):** [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) или другой faucet для Base Sepolia.
- **Base Mainnet:** на кошельке должен быть реальный ETH.

### 3.2 Деплой на Base Sepolia (рекомендуется сначала)

```bash
npm run compile
npm run deploy:sepolia
```

В выводе будет строка вида:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 3.3 Обновить .env

Скопируйте адрес и вставьте в `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...ваш_адрес...
NEXT_PUBLIC_HUNGER_DAYS=1
```

### 3.4 Деплой на Base Mainnet (когда всё проверено)

```bash
npm run deploy:mainnet
```

Обновите в `.env` адрес контракта и при необходимости:

```env
NEXT_PUBLIC_HUNGER_DAYS=7
```

---

## Часть 4. Деплой фронта (GitHub + Vercel)

### 4.1 Убедиться, что секреты не попадут в репозиторий

- В `.gitignore` должна быть строка `.env`.
- `PRIVATE_KEY` нигде не коммитить.

### 4.2 Залить проект на GitHub

```bash
git init
git add .
git commit -m "MONSTROHUNT v1.3"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/monstrohunt.git
git push -u origin main
```

(Замените `YOUR_USERNAME` и имя репозитория на свои.)

### 4.3 Подключить проект к Vercel

1. Зайдите на [vercel.com](https://vercel.com), войдите через GitHub.
2. **Add New Project** → выберите репозиторий `monstrohunt`.
3. В **Environment Variables** добавьте:

| Имя | Значение |
|-----|----------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Адрес задеплоенного контракта |
| `NEXT_PUBLIC_HUNGER_DAYS` | `1` (Sepolia) или `7` (mainnet) |
| `NEXT_PUBLIC_URL` | Итоговый URL приложения, например `https://monstrohunt.vercel.app` |

При необходимости: `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_ONCHAINKIT_API_KEY`.

4. Нажмите **Deploy**.

### 4.4 Результат

После деплоя приложение доступно по URL вида `https://ваш-проект.vercel.app`. Откройте этот URL **внутри Base App** — кошелёк подключится, игра должна работать.

---

## Часть 5. Публикация Mini App в Base App

Чтобы приложение было привязано к вашему аккаунту и его можно было нормально публиковать.

### 5.1 Картинки для манифеста (по желанию)

В `minikit.config.ts` указаны: `screenshot-portrait.png`, `icon.png`, `splash.png`. Положите их в папку `public/` (или измените пути в конфиге), затем закоммитьте и запушьте.

### 5.2 Отключить Deployment Protection в Vercel (для шага Verify)

Vercel → ваш проект → **Settings** → **Deployment Protection** → выключите **Vercel Authentication** → Save.

### 5.3 Получить accountAssociation

1. Запушьте актуальный код в `main`, дождитесь деплоя на Vercel.
2. Откройте [Base Build — Account association](https://www.base.dev/preview?tab=account).
3. В поле **App URL** введите ваш домен (например `monstrohunt.vercel.app`, без `https://`) → **Submit**.
4. Нажмите **Verify** и выполните подписание (привязка к Farcaster).
5. Скопируйте объект `accountAssociation` (поля `header`, `payload`, `signature`).

### 5.4 Вставить accountAssociation в проект

Откройте `minikit.config.ts` и вставьте скопированные значения:

```ts
export const minikitConfig = {
  accountAssociation: {
    header: "eyJ...",
    payload: "eyJ...",
    signature: "MHh..."
  },
  miniapp: {
    // ... остальное без изменений
  },
} as const;
```

Сохраните файл.

### 5.5 Залить изменения

```bash
git add minikit.config.ts
git commit -m "Add accountAssociation for Base Mini App"
git push origin main
```

Vercel задеплоит новую версию.

### 5.6 Проверка в Preview

1. Откройте [base.dev/preview](https://base.dev/preview).
2. Введите URL вашего приложения.
3. Проверьте: **Launch**, вкладку **Account association**, вкладку **Metadata**.

### 5.7 Публикация в Base App

Создайте **пост в Base App** с URL вашего приложения. После этого пользователи смогут открывать Mini App по ссылке.

---

## Чеклист

- [ ] Node.js 18+, зависимости установлены (`npm install`)
- [ ] Создан `.env` из `.env.example`, указаны `PRIVATE_KEY` и RPC
- [ ] `npm run compile` и `npm run dev` работают
- [ ] Контракт задеплоен (`deploy:sepolia` или `deploy:mainnet`)
- [ ] В `.env` указан `NEXT_PUBLIC_CONTRACT_ADDRESS` и `NEXT_PUBLIC_HUNGER_DAYS`
- [ ] Код на GitHub, `.env` не в репозитории
- [ ] Проект задеплоен на Vercel, заданы переменные окружения
- [ ] Приложение открывается по URL в Base App, кошелёк подключается
- [ ] (Публикация) Deployment Protection отключена, получен `accountAssociation`
- [ ] (Публикация) `accountAssociation` вставлен в `minikit.config.ts`, пуш в main
- [ ] (Публикация) Проверка на base.dev/preview, пост в Base App с URL

---

## Полезные ссылки

- [DEPLOYMENT.md](./DEPLOYMENT.md) — подробный гайд по деплою и верификации контракта
- [DEPLOY_TO_BASE.md](./DEPLOY_TO_BASE.md) — кратко: контракт → Vercel → Base App
- [PUBLISH_MINI_APP_BASE.md](./PUBLISH_MINI_APP_BASE.md) — детали публикации Mini App
- [START_SERVER.md](./START_SERVER.md) — запуск при кириллице в пути (Windows)
