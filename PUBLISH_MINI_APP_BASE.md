# Публикация Mini App в Base App

> **Documentation Index** — полный индекс документации Base: https://docs.base.org/llms.txt (используйте для поиска страниц).

Инструкция по официальному flow Base: деплой на Vercel → привязка аккаунта (account association) → публикация в Base App.

Основано на: [Create a Mini App — docs.base.org](https://docs.base.org/mini-apps/quickstart/create-new-miniapp/).

---

## Что нужно

- Аккаунт в [Base app](https://base.org)
- Аккаунт [Vercel](https://vercel.com) для хостинга

---

## Шаг 1. Деплой на Vercel

1. Залить проект на GitHub и подключить репозиторий к Vercel (**Add New Project**), либо использовать **Deploy** из существующего репо.
2. В настройках проекта Vercel задать переменные окружения:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_HUNGER_DAYS` (1 или 7)
   - при необходимости `NEXT_PUBLIC_URL=https://ваш-проект.vercel.app`
3. Дождаться успешного деплоя и запомнить production URL (например `https://monstrohunt.vercel.app`).

---

## Шаг 2. Настройка манифеста (`minikit.config.ts`)

Файл `minikit.config.ts` задаёт манифест по адресу `/.well-known/farcaster.json` и метаданные для эмбедов.

Можно менять поля объекта `miniapp` (название, описание, картинки, теги и т.д.). Справка по полям: [Manifest — Field reference](https://docs.base.org/mini-apps/features/manifest#field-reference).

Сейчас в проекте уже заданы:

- `name`: "Monstro Hunt"
- `subtitle`, `description`, `screenshotUrls`, `iconUrl`, `splashImageUrl`, `homeUrl`, `webhookUrl`, `tags` и др.

Убедитесь, что в Vercel задан `NEXT_PUBLIC_URL` (или используется `VERCEL_PROJECT_PRODUCTION_URL`), чтобы `ROOT_URL` в манифесте был вашим production URL.

---

## Шаг 3. Создание accountAssociation (привязка к Farcaster)

Чтобы приложение было связано с вашим Farcaster-аккаунтом и его можно было публиковать в Base App:

1. **Выложите все изменения в production:** запушьте в `main`, чтобы на Vercel был актуальный деплой.
2. **Отключите Deployment Protection в Vercel** (если включена):  
   Vercel Dashboard → ваш проект → **Settings** → **Deployment Protection** → выключите **Vercel Authentication** → Save.
3. Откройте [Base Build — Account association](https://www.base.dev/preview?tab=account).
4. В поле **App URL** вставьте ваш домен (например `monstrohunt.vercel.app`, без `https://`) и нажмите **Submit**.
5. Нажмите **Verify** и выполните шаги для подписания (привязка к вашему Farcaster-аккаунту).
6. Скопируйте сгенерированный объект `accountAssociation` (поля `header`, `payload`, `signature`).

---

## Шаг 4. Обновление `minikit.config.ts`

Вставьте скопированный `accountAssociation` в `minikit.config.ts`:

```ts
export const minikitConfig = {
  accountAssociation: {
    "header": "eyJ...",
    "payload": "eyJ...",
    "signature": "MHh..."
  },
  miniapp: {
    // ... остальное без изменений
  },
} as const;
```

Сохраните файл.

---

## Шаг 5. Пуш в production

Закоммитьте изменения и запушьте в `main`:

```bash
git add minikit.config.ts
git commit -m "Add accountAssociation for Base Mini App"
git push origin main
```

Vercel автоматически задеплоит новую версию.

---

## Шаг 6. Проверка в Preview

1. Откройте [base.dev/preview](https://base.dev/preview).
2. Введите URL вашего приложения.
3. Проверьте:
   - **Launch** — приложение открывается и работает.
   - вкладка **Account association** — учётные данные привязки созданы корректно.
   - вкладка **Metadata** — метаданные из манифеста отображаются, нет явно отсутствующих полей.

---

## Шаг 7. Публикация в Base App

Чтобы приложение появилось в Base App для пользователей:

- Создайте **пост в Base app** с URL вашего приложения (как в официальной инструкции: "Post to Publish").

После этого пользователи смогут открывать Mini App по ссылке и через Base App.

---

## Чеклист

- [ ] Проект задеплоен на Vercel, заданы `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_HUNGER_DAYS`, при необходимости `NEXT_PUBLIC_URL`
- [ ] Deployment Protection в Vercel отключена (для шага Verify)
- [ ] На [base.dev/preview?tab=account](https://www.base.dev/preview?tab=account) введён App URL и получен `accountAssociation`
- [ ] В `minikit.config.ts` вставлены `header`, `payload`, `signature`
- [ ] Изменения запушены в `main`, деплой на Vercel прошёл успешно
- [ ] На [base.dev/preview](https://base.dev/preview) проверены Launch, Account association и Metadata
- [ ] Опубликован пост в Base App с URL приложения

---

## Ссылки

- [Create a Mini App — docs.base.org](https://docs.base.org/mini-apps/quickstart/create-new-miniapp/)
- [Documentation index — docs.base.org/llms.txt](https://docs.base.org/llms.txt)
- [Farcaster Mini Apps — Publishing](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [Base Build — Preview / Account association](https://www.base.dev/preview)
