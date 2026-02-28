/**
 * Normalize unknown thrown value to a user-facing error message.
 * Tries to extract contract revert reason and user-rejected.
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === 'string') return e;

  const err = e as Error & { shortMessage?: string; details?: string; cause?: unknown };
  const msg = err?.shortMessage ?? err?.message ?? '';

  // User rejected in wallet
  if (/user rejected|user denied|rejected the request/i.test(msg)) {
    return 'Transaction was rejected';
  }

  // Base App / wallet transaction generation failure (often when wrong connector or gas estimation)
  if (/ошибка генерации транзакции|transaction generation|failed to generate|generation error/i.test(msg)) {
    return 'Transaction generation failed. Try again or check wallet balance.';
  }

  // Contract revert: viem often puts reason in "Contract call reverted with reason: ..." or "Error: ..."
  const revertMatch = msg.match(/reverted with reason[:\s]+["']?([^"'\n.]+)["']?/i)
    ?? msg.match(/reason[:\s]+["']?([^"'\n.]+)["']?/i)
    ?? msg.match(/Error[:\s]+([^\n.]+)/);
  if (revertMatch?.[1]) {
    return revertMatch[1].trim();
  }

  if (msg) return msg;
  return fallback;
}
