import type { Metadata } from 'next';
import { WalletProviderGate } from './WalletProviderGate';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ErrorSuppressor } from './components/ui/ErrorSuppressor';
import { minikitConfig } from '../minikit.config';
import './globals.css';

const m = minikitConfig.miniapp;
const homeUrl = m.homeUrl;

const frameEmbed = {
  version: '1' as const,
  imageUrl: m.heroImageUrl,
  button: {
    title: `Launch ${m.name}`,
    action: {
      type: 'launch_frame' as const,
      url: homeUrl,
      name: m.name,
      splashImageUrl: m.splashImageUrl,
      splashBackgroundColor: m.splashBackgroundColor,
    },
  },
};

export const metadata: Metadata = {
  title: 'Monstro Hunt - Onchain Monster Game',
  description: 'Create, feed, and hunt monsters on Base Network',
  other: {
    'base:app_id': '696b8f1dc0ab25addaaaf26b',
    'fc:frame': JSON.stringify(frameEmbed),
    'fc:miniapp': JSON.stringify(frameEmbed),
  },
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
