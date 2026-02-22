import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('returns Error message when e is Error', () => {
    expect(getErrorMessage(new Error('Custom error'), 'Fallback')).toBe('Custom error');
  });

  it('returns fallback when Error has empty message', () => {
    expect(getErrorMessage(new Error(''), 'Fallback')).toBe('Fallback');
  });

  it('returns string when e is string', () => {
    expect(getErrorMessage('Something failed', 'Fallback')).toBe('Something failed');
  });

  it('returns fallback for null', () => {
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback for undefined', () => {
    expect(getErrorMessage(undefined, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback for number', () => {
    expect(getErrorMessage(42, 'Fallback')).toBe('Fallback');
  });
});
