/**
 * Detect whether the app is running inside Base App / Farcaster Mini App context.
 */
export function isBaseApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Base App / Farcaster hostnames (app opened on their domain)
  if (
    window.location.hostname.includes('base.org') ||
    window.location.hostname.includes('base.dev') ||
    window.location.hostname.includes('farcaster.xyz') ||
    window.location.hostname.includes('warpcast.com')
  ) {
    return true;
  }

  // Base App injected flag (mobile/web injects this)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).ethereum?.isBaseApp === true) return true;

  // Opened from Base / Farcaster (e.g. link from base.dev preview or post)
  try {
    const ref = typeof document !== 'undefined' ? document.referrer : '';
    if (
      ref.includes('base.org') ||
      ref.includes('base.dev') ||
      ref.includes('farcaster.xyz') ||
      ref.includes('warpcast.com')
    ) {
      return true;
    }
  } catch {
    // ignore
  }

  // Farcaster frame: running inside iframe from Base / Farcaster
  try {
    if (window.parent !== window) {
      const parentHost = window.parent?.location?.hostname ?? '';
      if (
        parentHost.includes('warpcast.com') ||
        parentHost.includes('farcaster.xyz') ||
        parentHost.includes('base.org') ||
        parentHost.includes('base.dev')
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
