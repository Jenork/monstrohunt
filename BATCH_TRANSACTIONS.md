# EIP-5792 Batch Transactions

This project supports EIP-5792 batch transactions, allowing multiple transactions to be sent with a single wallet signature. This significantly improves UX by reducing the number of wallet prompts.

## Benefits

- **Single signature** for multiple transactions
- **Better UX** - fewer wallet prompts
- **Atomic execution** option (all succeed or all fail)
- **Automatic fallback** to sequential transactions if wallet doesn't support EIP-5792

## Implementation

### Base Hook: `useBatchTransactions`

Located in `app/hooks/useBatchTransactions.ts`, this hook provides:

- `sendBatch(calls, options?)` - Send multiple transactions in a batch
- `encodeCall(functionName, args, value?)` - Encode contract calls for batching

### Usage Example

```typescript
import { useBatchTransactions } from './hooks/useBatchTransactions';

function MyComponent() {
  const { sendBatch, encodeCall } = useBatchTransactions();

  const handleBatchFeed = async () => {
    // Feed monster 3 times with a single signature
    const calls = [
      encodeCall('feedMonster', [BigInt(monsterId)], feedCost1),
      encodeCall('feedMonster', [BigInt(monsterId)], feedCost2),
      encodeCall('feedMonster', [BigInt(monsterId)], feedCost3),
    ];

    await sendBatch(calls, { atomic: false });
  };
}
```

### Updated Hooks

#### `useFeedMonster`

Now supports batch feeding:

```typescript
const { feedMonster, feedMonsterBatch } = useFeedMonster();

// Single feed (existing behavior)
await feedMonster(monsterId, feedCost);

// Batch feed (new - EIP-5792)
await feedMonsterBatch(monsterId, [feedCost1, feedCost2, feedCost3]);
```

## Supported Wallets

EIP-5792 is supported by:
- **Coinbase Wallet** (Base App)
- **WalletConnect** (if wallet supports it)
- Other wallets implementing EIP-5792

If a wallet doesn't support EIP-5792, the hook automatically falls back to sequential transactions.

## Use Cases

1. **Multiple Feeds** - Feed monster multiple times with one signature
2. **Create + Actions** - Create monster and perform initial actions
3. **Multiple Hunts** - Hunt multiple monsters (if supported by game logic)

## Technical Details

- Uses `viem/experimental/eip5792` for EIP-5792 support
- Automatically checks wallet capabilities via `getCapabilities()`
- Falls back to sequential transactions if batch not supported
- Supports both atomic and non-atomic execution

## References

- [EIP-5792 Specification](https://eips.ethereum.org/EIPS/eip-5792)
- [Viem EIP-5792 Docs](https://viem.sh/experimental/eip5792/sendCalls)
- [Base App Guidelines](https://docs.base.org/mini-apps/featured-guidelines/technical-guidelines)
