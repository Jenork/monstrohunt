# 🐲 MONSTROHUNT

Fully onchain monster hunting game on Base Network. Players create monsters for ETH, feed them, and hunt others who forgot to feed. No tokens, no NFTs - just ETH.

## 🎮 Game Overview

**Core Rule:** If a player feeds on time, they never lose money. All gains come only from other players' mistakes.

- **No tokens** - Pure ETH game
- **No NFTs** - Simple ownership model
- **No upgradeability** - Final economy v1.3 (LOCKED)

## ✨ Features

- **Create Monsters**: Choose from 3 tiers (Scout 0.001 ETH, Hunter 0.005 ETH, Leviathan 0.01 ETH)
- **Feed System**: Feed monsters every 7 days to keep them alive
- **Reward System**: Earn ETH from 65% of hunted monsters' weight (distributed to alive monsters proportionally)
- **Hunting**: Hunt starved monsters (7 days without feeding) - 30% reward to hunter + 20min cooldown
- **Risk/Reward**: Lose your monster if you forget to feed!

## 💰 Economic Model (FINAL v1.3)

### Tiers
- **Scout**: 0.001 ETH
- **Hunter**: 0.005 ETH
- **Leviathan**: 0.01 ETH

### Rules
- **Hunger Timer**: 7 days
- **Feed Cost**: 5% initial weight + 5% current weight (no protocol fee)
- **Hunt Cooldown**: 20 minutes after each attempt
- **Death Distribution**: Hunter 30%, Alive monsters 65%, Protocol 5%
- **Sell Fee**: 1% protocol fee (only if not starved)
- **1 wallet = 1 monster** (enforced by contract)

### Protocol Fees
- **5%** on monster deaths
- **1%** on sell
- **0%** on creation and feeding

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: Wagmi, Viem
- **Blockchain**: Base Network (Mainnet)
- **Smart Contract**: Solidity 0.8.20

## ✅ Base App only

This build is designed for **Base App / Farcaster Mini App** only.
Open the app **inside Base App** to use the встроенный wallet provider.
Browser WalletConnect / RainbowKit are removed.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env and add your private key and RPC URLs
```

### 3. Compile Contract
```bash
npm run compile
```

### 4. Deploy Contract
```bash
npm run deploy:mainnet
```
(For testnet: `npm run deploy:sepolia` and set `NEXT_PUBLIC_HUNGER_DAYS=1` in `.env`.)

### 5. Update Contract Address
After deployment, update `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_contract_address...
```

```bash
npm run dev
```

Open http://localhost:3000

## 📁 Project Structure

```
app/
├── components/
│   ├── screens/     # HomeScreen, CreateScreen, ManageScreen, HuntScreen, FAQScreen
│   └── ui/          # MonsterCard, HuntCard, StatusDisplay, PanelTabs, ToastContainer, BackgroundMusic
├── hooks/           # useMyMonsters, useMonsterInfo, useCreateMonster, etc.
├── types/           # monster.ts, screen.ts
├── constants/       # game.ts (FINAL ECONOMY v1.3), avatars.ts
├── utils/          # format.ts, contract.ts, monster.ts
├── contracts/       # monstroHunt.ts (ABI)
└── page.tsx         # Main page with routing
```

## 📜 Smart Contract Functions

- `createMonster(bytes32 name, uint8 avatarId, uint8 tier)` - Create a monster (payable)
- `feedMonster(uint256 monsterId)` - Feed your monster (payable)
- `huntMonster(uint256 targetMonsterId)` - Hunt a starved monster
- `sellMonster(uint256 monsterId)` - Sell your monster (only if not starved)

### View Functions
- `getMonster(uint256 monsterId)` - Get monster data
- `getOwnerMonsterId(address owner)` - Get monster ID for owner (0 if none)
- `isStarved(uint256 monsterId)` - Check if monster is starved
- `getFeedCost(uint256 monsterId)` - Calculate feed cost
- `getPendingRewards(uint256 monsterId)` - Get pending rewards
- `canHunt(address hunter, uint256 targetMonsterId)` - Check if hunt is possible

## 🎯 Deployment

- [DEPLOYMENT.md](./DEPLOYMENT.md) — деплой контракта и фронтенда.
- [DEPLOY_TO_BASE.md](./DEPLOY_TO_BASE.md) — деплой в Base (контракт + Vercel).
- [PUBLISH_MINI_APP_BASE.md](./PUBLISH_MINI_APP_BASE.md) — публикация Mini App в Base App (account association, [base.dev/preview](https://base.dev/preview), пост в Base app). Соответствует [Create a Mini App](https://docs.base.org/mini-apps/quickstart/create-new-miniapp/) (docs.base.org).

## ⚠️ Important Notes

1. **Economy is FINAL** - Contract cannot be upgraded
2. **No admin controls** - Protocol fees are hard-coded
3. **1 wallet = 1 monster** - Enforced by contract
4. **Test thoroughly** before mainnet deployment

## 📝 License

MIT
