/**
 * Achievement definitions for ERC-1155 NFT badges.
 * Token IDs can map 1:1 to these ids when the contract is deployed.
 */
export const ACHIEVEMENT_IDS = {
  swamp: 1,
  goblin: 2,
  zombie: 3,
  ice: 4,
  demon: 5,
  cthulhu: 6,
} as const;

export type AchievementId = keyof typeof ACHIEVEMENT_IDS;

export interface AchievementMeta {
  id: AchievementId;
  name: string;
  description: string;
  condition: string;
  /** Swamp is free on app entry, no on-chain condition */
  free: boolean;
  /** Emoji or short label for the badge */
  icon: string;
}

export const ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: 'swamp',
    name: 'Swamp',
    description: 'You entered the game.',
    condition: 'Free — claim when you open the app.',
    free: true,
    icon: '🌿',
  },
  {
    id: 'goblin',
    name: 'Goblin',
    description: 'You created a monster.',
    condition: 'Create a monster in the Create tab.',
    free: false,
    icon: '👺',
  },
  {
    id: 'zombie',
    name: 'Zombie',
    description: 'You fed your monster at least once.',
    condition: 'Feed your monster in the Manage tab.',
    free: false,
    icon: '🧟',
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'You completed your first successful hunt.',
    condition: 'Hunt a starved monster in the Hunt tab.',
    free: false,
    icon: '❄️',
  },
  {
    id: 'demon',
    name: 'Demon',
    description: "Your monster was killed by another player's hunt.",
    condition: 'Your monster gets hunted while starved.',
    free: false,
    icon: '👹',
  },
  {
    id: 'cthulhu',
    name: 'Cthulhu',
    description: 'You collected all previous achievement NFTs.',
    condition: 'Own Swamp, Goblin, Zombie, Ice, and Demon.',
    free: false,
    icon: '🐙',
  },
];
