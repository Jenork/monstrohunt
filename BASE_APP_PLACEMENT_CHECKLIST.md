# Base App Mini App Placement — Checklist & Form Copy

Use this when submitting the [Mini App Placement](https://base.org or Base.dev) form.

---

## 1. Registration & basics

- **Have you registered your mini app to Base.dev?**  
  → **Yes** (do this first at [Base.dev](https://www.base.dev) — add your Mini App URL and metadata).
- **Mini App URL:** your live URL, e.g. `https://your-app.vercel.app`.
- **Mini App Name:** `Monstro Hunt`.

---

## 2. Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Onboarding:** “Clear, concise language and visuals explaining what it is and how it works” | ⚠️ Partial | Home is only title + PLAY. FAQ has full rules. Consider adding 1–2 short lines on home (e.g. “Create a monster, feed it, hunt others”) or keep FAQ as “how it works”. |
| **Profile (avatar + username) instead of raw addresses** | ✅ Partial | App shows **avatar (initials) + short address** in WalletCorner and HuntCard via `AddressProfile`. For full Basename/username, upgrade to OnchainKit 1.x + Identity when miniapp-sdk is upgraded to ^0.2.3. |
| **Auth inside Base app, no external redirects; explore before sign-in** | ✅ | Wallet is in-app (MiniKit/wagmi). User can open app and see home/FAQ before connecting. |
| **Client-agnostic (no “Farcaster only” etc.)** | ✅ | No Farcaster-only links or labels in UI. Docs mention Farcaster in technical context only. |
| **Batch sequential on-chain actions (EIP-5792) where applicable** | ✅ | `useBatchTransactions` + `feedMonsterBatch` implemented. Single feed is one tx; batch used for multiple feeds. |

---

## 3. Suggested form answers (Yes/No)

- Have you registered your mini app to Base.dev? → **Yes**
- Does your mini app have an onboarding flow…? → **Yes** (if you add a short line on home) or **No** (if you rely only on FAQ; then add onboarding before resubmitting).
- Does the app display the user’s profile (avatar + username) instead of raw addresses? → **No** until you add OnchainKit Identity; then **Yes**.
- Does your app’s authentication flow keep the user entirely inside the Base app…? → **Yes**
- Have you removed client-specific behaviors/wording? → **Yes**
- Where applicable, do you batch sequential on-chain actions (EIP-5792)? → **Yes**

---

## 4. Copy for the form

**Short Tagline (~5 words)**  
- `Create, feed, and hunt monsters on Base`

**Brief Description (~20 words)**  
- `Onchain game on Base. Create a monster for ETH, feed it in time, hunt starved monsters for rewards. Pure ETH, no tokens or NFTs.`

**X (Twitter) Handle**  
- e.g. `@MonstroHunt` or your app’s handle

**Best Contact Method**  
- e.g. `mrjenork@gmail.com` or Telegram/Slack

---

## 5. Assets needed

- **Logo:** square, min 512×512 (PNG/SVG/JPG), max 10 MB.
- **Promotional image:** 1002×548 (PNG/SVG/JPG/GIF). Keep text centered; avoid edge-to-edge text (may be cropped).
- Optional: tutorial video, extra screenshots/marketing assets.

---

## 6. Recommended code changes before submission

1. **Profile instead of address (required by guidelines)**  
   - In **WalletCorner:** show OnchainKit Identity (avatar + name) for the connected address instead of `formatAddress(address)`.
   - In **HuntCard:** show Identity for `monster.owner` instead of `formatAddress(monster.owner)`.
   - Requires `@coinbase/onchainkit` Identity components and possibly `NEXT_PUBLIC_ONCHAINKIT_API_KEY` (you already use OnchainKit).

2. **Onboarding (recommended)**  
   - On home, add one short line under the title, e.g. “Create a monster, feed it in time, hunt others for ETH” so the “onboarding” answer can be **Yes**.

3. **minikit.config.ts**  
   - Fill **Short Tagline** in the form; optionally set `tagline` in `minikit.config.ts` to the same line so the app listing is consistent.

After these, re-check the form answers and submit.
