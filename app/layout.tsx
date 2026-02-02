import type { Metadata } from 'next';
import { WalletProviderGate } from './WalletProviderGate';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ErrorSuppressor } from './components/ui/ErrorSuppressor';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monstro Hunt - Onchain Monster Game',
  description: 'Create, feed, and hunt monsters on Base Network',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorSuppressor />
        <ErrorBoundary>
          <div className="safeArea">
            <WalletProviderGate>{children}</WalletProviderGate>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
