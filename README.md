<<<<<<< HEAD
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
- **Reward System**: Earn ETH from 75% of hunted monsters' weight (distributed proportionally)
- **Hunting**: Hunt starved monsters (7 days without feeding) - 20% reward + 20min cooldown
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
- **Death Distribution**: Hunter 20%, Alive monsters 75%, Protocol 5%
- **Sell Fee**: 1% protocol fee (only if not starved)
- **1 wallet = 1 monster** (enforced by contract)

### Protocol Fees
- **5%** on monster deaths
- **1%** on sell
- **0%** on creation and feeding

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: Wagmi, Viem
- **Blockchain**: Base Network (Sepolia/Mainnet)
- **Smart Contract**: Solidity 0.8.20

## ⚠️ Temporary: Browser wallet (test only)

**Wagmi and RainbowKit are used only for browser-based testnet testing.** When the app is opened in a regular browser (not inside Base App), MetaMask / WalletConnect can be used to connect. When opened inside Base App, MiniKit remains the primary wallet source. All UI and contract logic use a single hook `usePlayerAddress()` so wallet logic is not duplicated. This integration is **temporary** and will be removed before Base App production launch. Do not rely on it for production.

Optional: set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for WalletConnect in browser mode.

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

### 4. Deploy to Testnet
```bash
npm run deploy:sepolia
```

### 5. Update Contract Address
After deployment, update `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_contract_address...
```

### 6. Run Development Server
=======
# Waitlist Mini App Quickstart

This is a demo Mini App application built using OnchainKit and the Farcaster SDK. Build a waitlist sign-up mini app for your company that can be published to the Base app and Farcaster. 

> [!IMPORTANT]  
> Before interacting with this demo, please review our [disclaimer](#disclaimer) — there are **no official tokens or apps** associated with Cubey, Base, or Coinbase.

## Prerequisites

Before getting started, make sure you have:

* Base app account
* A [Farcaster](https://farcaster.xyz/) account
* [Vercel](https://vercel.com/) account for hosting the application
* [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) Client API Key

## Getting Started

### 1. Clone this repository 

```bash
git clone https://github.com/base/demos.git
```

### 2. Install dependencies:

```bash
cd demos/minikit/waitlist-mini-app-qs
npm install
```

### 3. Configure environment variables

Create a `.env.local` file and add your environment variables:

```bash
NEXT_PUBLIC_PROJECT_NAME="Your App Name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<Replace-WITH-YOUR-CDP-API-KEY>
NEXT_PUBLIC_URL=
```

### 4. Run locally:

>>>>>>> 214d1c9b6352835945e7531f278088502c8f4034
```bash
npm run dev
```

<<<<<<< HEAD
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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## ⚠️ Important Notes

1. **Economy is FINAL** - Contract cannot be upgraded
2. **No admin controls** - Protocol fees are hard-coded
3. **1 wallet = 1 monster** - Enforced by contract
4. **Test thoroughly** before mainnet deployment

## 📝 License

MIT
=======
## Customization

### Update Manifest Configuration

The `minikit.config.ts` file configures your manifest located at `app/.well-known/farcaster.json`.

**Skip the `accountAssociation` object for now.**

To personalize your app, change the `name`, `subtitle`, and `description` fields and add images to your `/public` folder. Then update their URLs in the file.

## Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```

You should have a URL deployed to a domain similar to: `https://your-vercel-project-name.vercel.app/`

### 2. Update environment variables

Add your production URL to your local `.env` file:

```bash
NEXT_PUBLIC_PROJECT_NAME="Your App Name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<Replace-WITH-YOUR-CDP-API-KEY>
NEXT_PUBLIC_URL=https://your-vercel-project-name.vercel.app/
```

### 3. Upload environment variables to Vercel

Add environment variables to your production environment:

```bash
vercel env add NEXT_PUBLIC_PROJECT_NAME production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
vercel env add NEXT_PUBLIC_URL production
```

## Account Association

### 1. Sign Your Manifest

1. Navigate to [Farcaster Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Paste your domain in the form field (ex: your-vercel-project-name.vercel.app)
3. Click the `Generate account association` button and follow the on-screen instructions for signing with your Farcaster wallet
4. Copy the `accountAssociation` object

### 2. Update Configuration

Update your `minikit.config.ts` file to include the `accountAssociation` object:

```ts
export const minikitConfig = {
    accountAssociation: {
        "header": "your-header-here",
        "payload": "your-payload-here",
        "signature": "your-signature-here"
    },
    frame: {
        // ... rest of your frame configuration
    },
}
```

### 3. Deploy Updates

```bash
vercel --prod
```

## Testing and Publishing

### 1. Preview Your App

Go to [base.dev/preview](https://base.dev/preview) to validate your app:

1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected
2. Use the "Account association" tab to verify the association credentials were created correctly
3. Use the "Metadata" tab to see the metadata added from the manifest and identify any missing fields

### 2. Publish to Base App

To publish your app, create a post in the Base app with your app's URL.

## Learn More

For detailed step-by-step instructions, see the [Create a Mini App tutorial](https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/) in the Base documentation.


---

## Disclaimer  

This project is a **demo application** created by the **Base / Coinbase Developer Relations team** for **educational and demonstration purposes only**.  

**There is no token, cryptocurrency, or investment product associated with Cubey, Base, or Coinbase.**  

Any social media pages, tokens, or applications claiming to be affiliated with, endorsed by, or officially connected to Cubey, Base, or Coinbase are **unauthorized and fraudulent**.  

We do **not** endorse or support any third-party tokens, apps, or projects using the Cubey name or branding.  

> [!WARNING]
> Do **not** purchase, trade, or interact with any tokens or applications claiming affiliation with Coinbase, Base, or Cubey.  
> Coinbase and Base will never issue a token or ask you to connect your wallet for this demo.  

For official Base developer resources, please visit:  
- [https://base.org](https://base.org)  
- [https://docs.base.org](https://docs.base.org)  

---
>>>>>>> 214d1c9b6352835945e7531f278088502c8f4034
