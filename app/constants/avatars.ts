export const AVATARS = [
  { id: 0, image: '/monsters/demon.png', name: 'Demon' },
  { id: 1, image: '/monsters/goblin.png', name: 'Goblin' },
  { id: 2, image: '/monsters/ice.png', name: 'Ice' },
  { id: 3, image: '/monsters/ktulhu.png', name: 'Ktulhu' },
  { id: 4, image: '/monsters/swamp.png', name: 'Swamp' },
  { id: 5, image: '/monsters/zombie.png', name: 'Zombie' },
] as const;

export type AvatarId = typeof AVATARS[number]['id'];
