import type { Metadata } from 'next';
import { WalletProviderGate } from './WalletProviderGate';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ErrorSuppressor } from './components/ui/ErrorSuppressor';
import { minikitConfig } from '../minikit.config';
import '@coinbase/onchainkit/styles.css';
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
    'talentapp:project_verification': '2a07dd8369de522b4996a98ac28d75b65d36ea14f5258ff354792b2241e550e016f49c4e22dc8e84b9ab572f46b47c7668883bc3f53a50002ba9f2f7fdd238bf',
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
