/**
 * TEMPORARY: Single unified wallet address. Use this everywhere instead of useAccount.
 * Returns MiniKit address when inside Base App, wagmi address when in browser.
 * Remove when browser-only testing is removed.
 */
export { usePlayerAddress } from '../contexts/PlayerAddressContext';
