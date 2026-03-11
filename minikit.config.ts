const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (typeof process !== 'undefined' && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjE0MjU4MzAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1RTE2MzQyZDQwRTg2RWFCZDI5NWY2ODg1NzMyYjZiNzhjREY3MEI1In0",
    payload: "eyJkb21haW4iOiJtb25zdHJvaHVudC0zNnN3LnZlcmNlbC5hcHAifQ",
    signature: "WvI9mb2HLaV4f+iVhXw1e64PE3C9ys7vak6x8knraYJ/1P73yinB6k1WHKR3CEXlTsU+SSI5yZbCku9zMb3nzxs="
  },
  miniapp: {
    version: "1",
    name: "Monstro Hunt",
    subtitle: "",
    description: "Onchain monster hunting game on Base",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "gaming", "base", "onchain"],
    heroImageUrl: `${ROOT_URL}/og.png`,
    tagline: "",
    ogTitle: "Monstro Hunt - Onchain Monster Game on Base",
    ogDescription: "Create, feed, and hunt monsters on Base Network. Pure ETH game with no tokens or NFTs.",
    ogImageUrl: `${ROOT_URL}/og.png`,
  },
} as const;
