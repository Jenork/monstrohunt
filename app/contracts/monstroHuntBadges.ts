export const monstroHuntBadgesABI = [
  {
    type: 'function',
    name: 'claimSwamp',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      { name: 'account', type: 'address', internalType: 'address' },
      { name: 'id', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasClaimedSwamp',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'SwampClaimed',
    inputs: [{ name: 'to', type: 'address', indexed: true, internalType: 'address' }],
  },
] as const;

export const BADGES_TOKEN_IDS = {
  swamp: 1,
  goblin: 2,
  zombie: 3,
  ice: 4,
  demon: 5,
  cthulhu: 6,
} as const;
