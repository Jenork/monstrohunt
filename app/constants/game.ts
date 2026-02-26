// Base Mainnet - Economy LOCKED
// NEXT_PUBLIC_HUNGER_DAYS=3 (mainnet). For testnet use 1.
export const HUNGER_DAYS = Number(process.env.NEXT_PUBLIC_HUNGER_DAYS || 3);

export type Tier = 0 | 1 | 2; // Scout, Hunter, Leviathan

export const HUNGER_WINDOW = HUNGER_DAYS * 24 * 60 * 60; // in seconds
export const HUNT_COOLDOWN = 20 * 60; // 20 minutes in seconds

export const TIERS = {
  SCOUT: BigInt('1000000000000000'),      // 0.001 ETH
  HUNTER: BigInt('5000000000000000'),     // 0.005 ETH
  LEVIATHAN: BigInt('10000000000000000'), // 0.01 ETH
} as const;

export const TIER_NAMES = {
  0: 'Scout',
  1: 'Hunter',
  2: 'Leviathan',
} as const;

export const TIER_PRICES = {
  0: TIERS.SCOUT,
  1: TIERS.HUNTER,
  2: TIERS.LEVIATHAN,
} as const;

// Distribution shares (LOCKED)
export const HUNTER_SHARE_BP = 3000;   // 30%
export const ALIVE_SHARE_BP = 6500;    // 65%
export const PROTOCOL_SHARE_BP = 500;  // 5%

// Sell fee (LOCKED)
export const SELL_FEE_BP = 100;  // 1%

// Status colors for visual hunger display
export const STATUS_COLORS = {
  calm: '#4CAF50',     // Green - well fed
  hungry: '#FFC107',   // Yellow - getting hungry
  critical: '#FF5722', // Orange - urgent
  starved: '#F44336',  // Red - can be hunted
} as const;

export type HungerStatus = 'calm' | 'hungry' | 'critical' | 'starved';
