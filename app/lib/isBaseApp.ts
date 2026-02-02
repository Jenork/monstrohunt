/**
 * TEMPORARY: Used to branch between Base App (MiniKit) and browser (wagmi/RainbowKit).
 * Detect whether the app is running inside Base App / Farcaster Mini App context.
 * Remove this file when browser-only testing is no longer needed.
 */
export function isBaseApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Base App / Farcaster hostnames
  if (
    window.location.hostname.includes('base.org') ||
    window.location.hostname.includes('farcaster.xyz') ||
    window.location.hostname.includes('warpcast.com')
  ) {
    return true;
  }

  // Base App injected flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).ethereum?.isBaseApp === true) return true;

  // Farcaster frame: running inside iframe from Farcaster
  try {
    if (window.parent !== window) {
      const parentHost = window.parent?.location?.hostname ?? '';
      if (
        parentHost.includes('warpcast.com') ||
        parentHost.includes('farcaster.xyz') ||
        parentHost.includes('base.org')
      ) {
        return true;
      }
    }
  } catch {
    // Cross-origin iframe: assume Base App
    return true;
  }

  return false;
}
