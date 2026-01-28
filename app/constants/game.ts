// FINAL ECONOMY v1.3 Constants
export type Tier = 0 | 1 | 2; // Scout, Hunter, Leviathan

export const HUNGER_WINDOW = 7 * 24 * 60 * 60; // 7 days in seconds
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

// Feed formula: 5% initialWeight + 5% currentWeight
export const FEED_INITIAL_BP = 500;  // 5%
export const FEED_CURRENT_BP = 500;  // 5%

// Distribution shares
export const HUNTER_SHARE_BP = 2000;  // 20%
export const ALIVE_SHARE_BP = 7500;    // 75%
export const PROTOCOL_SHARE_BP = 500;  // 5%

// Sell fee
export const SELL_FEE_BP = 100;  // 1%

export const STATUS_COLORS = {
  fed: '#4CAF50',
  hungry: '#FFC107',
  starved: '#F44336',
} as const;
