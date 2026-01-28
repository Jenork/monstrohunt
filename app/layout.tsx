import type { Metadata } from 'next';
import { Providers } from './providers';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ErrorSuppressor } from './components/ui/ErrorSuppressor';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monstro Hunt - Onchain Monster Game',
  description: 'Create, feed, and hunt monsters on Base Network',
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
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
