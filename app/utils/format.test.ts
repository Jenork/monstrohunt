import { describe, it, expect } from 'vitest';
import { formatETH, formatAddress, formatMonsterName, formatTime } from './format';

describe('formatETH', () => {
  it('formats 0.001 ETH with 6 decimals', () => {
    expect(formatETH(BigInt('1000000000000000'))).toBe('0.001');
  });

  it('formats 1 ETH', () => {
    expect(formatETH(BigInt('1000000000000000000'))).toBe('1');
  });

  it('formats 0 as 0', () => {
    expect(formatETH(BigInt(0))).toBe('0');
  });
});

describe('formatAddress', () => {
  it('shortens 0x address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(formatAddress(addr)).toBe('0x1234...5678');
  });
});

describe('formatMonsterName', () => {
  it('returns Unnamed for undefined', () => {
    expect(formatMonsterName(undefined)).toBe('Unnamed');
  });

  it('returns Unnamed for empty string', () => {
    expect(formatMonsterName('')).toBe('Unnamed');
  });

  it('decodes valid bytes32 hex name', () => {
    // "Test" in bytes32: 0x5465737400000000...
    const hex = '5465737400000000000000000000000000000000000000000000000000000000';
    expect(formatMonsterName('0x' + hex)).toBe('Test');
  });

  it('returns Unnamed for invalid hex length', () => {
    expect(formatMonsterName('0x1234')).toBe('Unnamed');
  });
});

describe('formatTime', () => {
  it('formats seconds', () => {
    expect(formatTime(BigInt(45))).toBe('45s');
  });

  it('formats minutes', () => {
    expect(formatTime(BigInt(120))).toBe('2m');
  });

  it('formats hours', () => {
    expect(formatTime(BigInt(7200))).toBe('2h');
  });

  it('formats days', () => {
    expect(formatTime(BigInt(86400 * 2))).toBe('2d');
  });
});
