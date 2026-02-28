# Code Review & Refactor Summary

## Основное исправление: «ошибка генерации транзакции»

**Причина:** Использовался `injected()` connector, который берёт `window.ethereum`. В Base App кошелёк инжектируется иначе, и для корректной работы транзакций нужен **farcasterMiniApp** connector.

**Решение:** Заменён `injected()` на `farcasterMiniApp()` из `@farcaster/miniapp-wagmi-connector`. Этот connector использует `sdk.wallet.getEthereumProvider()` — правильный провайдер для Base Account и транзакций в Base App.

## Изменения по файлам

### `app/browserWalletProvider.tsx`
- `injected()` → `farcasterMiniApp()`
- Добавлена зависимость `@farcaster/miniapp-wagmi-connector`

### `app/hooks/useCreateMonster.ts`
- Добавлен `isCreating` state для корректного отображения загрузки при sendCalls/prepared tx
- `isPending` теперь включает `isCreating`
- `setIsCreating(false)` в `finally` блока

### `app/utils/error.ts`
- Обработка «ошибка генерации транзакции» / «transaction generation» с понятным сообщением пользователю

### `app/hooks/useBatchTransactions.ts`
- Добавлен `chain: base` в `sendCalls` для EIP-5792

### `app/hooks/useFeedMonster.ts`, `useHuntMonster.ts`, `useSellMonster.ts`
- Добавлен `chainId: base.id` во все вызовы `writeContractAsync`

### `app/components/screens/AchievementsScreen.tsx`
- Добавлен `chainId: base.id` в `writeClaimSwamp`

### Удалено
- `app/utils/isInBaseApp.ts` — не использовался (есть `lib/isBaseApp.ts`)

## Рекомендации

1. **Пересобери и задеплой** — после пуша Vercel пересоберёт приложение.
2. **Проверь в Base App** — создание монстра должно работать с farcasterMiniApp connector.
3. Если ошибка сохранится — открой консоль (F12) в Base App и посмотри логи `[useCreateMonster]` для отладки.
