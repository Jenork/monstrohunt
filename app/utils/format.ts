import { formatUnits } from 'viem';

export function formatETH(value: bigint, decimals: number = 6): string {
  return formatUnits(value, 18).slice(0, decimals === 6 ? undefined : decimals + 3);
}

export function formatTime(seconds: bigint): string {
  const s = Number(seconds);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatMonsterName(name: string): string {
  // Convert bytes32 to string and trim null bytes
  return name.replace(/\0/g, '').trim() || 'Unnamed';
}
