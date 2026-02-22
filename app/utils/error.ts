/**
 * Normalize unknown thrown value to a user-facing error message.
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'string') return e;
  return fallback;
}
