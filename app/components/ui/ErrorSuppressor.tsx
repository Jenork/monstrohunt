'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress errors from browser extensions (like TronLink)
    const originalError = window.console.error;
    window.console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      
      // Ignore errors from browser extensions
      if (
        errorMessage.includes('tronlinkParams') ||
        errorMessage.includes('chrome-extension') ||
        errorMessage.includes("'set' on proxy") ||
        errorMessage.includes('trap returned falsish')
      ) {
        // Silently ignore extension-related errors
        return;
      }
      
      // Log other errors normally
      originalError.apply(window.console, args);
    };

    // Also catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      if (
        errorMessage.includes('tronlinkParams') ||
        errorMessage.includes('chrome-extension') ||
        errorMessage.includes("'set' on proxy") ||
        errorMessage.includes('trap returned falsish')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.console.error = originalError;
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
