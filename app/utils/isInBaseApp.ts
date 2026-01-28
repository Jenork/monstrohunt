export function isInBaseApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Base App environment
  return (
    window.location.hostname.includes('base.org') ||
    window.location.hostname.includes('farcaster.xyz') ||
    // @ts-ignore
    window.ethereum?.isBaseApp === true
  );
}
