import { MonsterInfo } from '../types/monster';
import { TIER_PRICES, HUNGER_WINDOW } from '../constants/game';
import { getMonsterStatus } from './monster';

// Mock player addresses
const MOCK_OWNERS = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8ba1f109551bD432803012645Hac136c22C1779',
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0xfedcbafedcbafedcbafedcbafedcbafedcbafedc',
  '0x9876543210987654321098765432109876543210',
];

// Mock monster names
const MOCK_NAMES = [
  'ShadowBeast',
  'DarkLord',
  'BloodThirst',
  'Nightmare',
  'DoomBringer',
  'ChaosDemon',
  'SoulEater',
  'DeathWing',
  'VoidWalker',
  'HellFire',
];

// Generate mock monsters for demo
export function generateMockMonsters(count: number = 8): MonsterInfo[] {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const hungerWindow = BigInt(HUNGER_WINDOW);
  const monsters: MonsterInfo[] = [];

  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const avatarId = i % 6;
    const tier = (i % 3) as 0 | 1 | 2;
    const initialWeight = TIER_PRICES[tier];
    
    let hungerDeadline: bigint;
    let weight: bigint;
    let isStarved = false;
    
    if (i === 0) {
      // ID 1 - your monster (calm - just fed)
      hungerDeadline = currentTime + hungerWindow;
      weight = initialWeight + (initialWeight * BigInt(20) / BigInt(100));
    } else if (i < 3) {
      // 2 starved monsters - can be hunted
      hungerDeadline = currentTime - BigInt(3600);
      weight = initialWeight + (initialWeight * BigInt(10) / BigInt(100));
      isStarved = true;
    } else if (i < 5) {
      // 2 critical monsters (low time remaining)
      hungerDeadline = currentTime + BigInt(HUNGER_WINDOW / 10); // 10% time left
      weight = initialWeight + (initialWeight * BigInt(5) / BigInt(100));
    } else {
      // Rest - calm or hungry
      const fraction = BigInt((i - 4) * 10);
      hungerDeadline = currentTime + (hungerWindow * fraction) / BigInt(100);
      weight = initialWeight + (initialWeight * BigInt(15) / BigInt(100));
    }

    const monsterData = {
      id,
      name: MOCK_NAMES[i % MOCK_NAMES.length],
      avatarId,
      tier,
      initialWeight,
      weight,
      hungerDeadline,
      alive: true,
      lastRewardIndex: BigInt(0),
      lastHuntAttemptAt: BigInt(0),
      owner: MOCK_OWNERS[i % MOCK_OWNERS.length],
    };

    const monster: MonsterInfo = {
      ...monsterData,
      status: getMonsterStatus(monsterData, currentTime, isStarved && id !== 1),
      pendingRewards: id === 1 ? BigInt('500000000000000') : BigInt(0),
      feedCost: (initialWeight * BigInt(500) / BigInt(10000)) + (weight * BigInt(500) / BigInt(10000)),
    };

    monsters.push(monster);
  }

  return monsters;
}

// Проверка, используется ли mock режим
export function isMockMode(): boolean {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  return contractAddress === '0x0000000000000000000000000000000000000000';
}
