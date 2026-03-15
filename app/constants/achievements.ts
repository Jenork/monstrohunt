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
  /** Monster image path (from /monsters/) */
  image: string;
}

export const ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: 'swamp',
    name: 'Swamp',
    description: 'You entered the game.',
    condition: 'Free — claim when you open the app.',
    free: true,
    image: '/monsters/swamp.png',
  },
  {
    id: 'goblin',
    name: 'Goblin',
    description: 'You created your first monster.',
    condition: 'Create a monster at least once in the Create tab.',
    free: false,
    image: '/monsters/goblin.png',
  },
  {
    id: 'zombie',
    name: 'Zombie',
    description: 'You fed your monster at least once.',
    condition: 'Feed your monster in the Manage tab.',
    free: false,
    image: '/monsters/zombie.png',
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'You completed your first successful hunt.',
    condition: 'Hunt a starved monster in the Hunt tab.',
    free: false,
    image: '/monsters/ice.png',
  },
  {
    id: 'demon',
    name: 'Demon',
    description: "Your monster was killed by another player's hunt.",
    condition: 'Your monster gets hunted while starved.',
    free: false,
    image: '/monsters/demon.png',
  },
  {
    id: 'cthulhu',
    name: 'Cthulhu',
    description: 'You collected all previous achievement NFTs.',
    condition: 'Own Swamp, Goblin, Zombie, Ice, and Demon.',
    free: false,
    image: '/monsters/ktulhu.png',
  },
];
