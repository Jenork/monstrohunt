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

/**
 * Decode contract bytes32 name to display string.
 * Contract returns name as bytes32; wagmi returns it as hex "0x" + 64 hex chars.
 * Never use or display this as an address — owner must come from getMonster().owner only.
 */
export function formatMonsterName(nameBytes: string | undefined): string {
  if (!nameBytes) return 'Unnamed';
  if (typeof nameBytes === 'string' && nameBytes.startsWith('0x')) {
    try {
      const hex = nameBytes.slice(2);
      if (hex.length !== 64) return 'Unnamed';
      const bytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      }
      const decoded = new TextDecoder().decode(bytes);
      return decoded.replace(/\0/g, '').trim() || 'Unnamed';
    } catch {
      return 'Unnamed';
    }
  }
  return String(nameBytes).replace(/\0/g, '').trim() || 'Unnamed';
}
