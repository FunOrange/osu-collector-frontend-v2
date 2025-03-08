import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/utils/shadcn-utils';
import { Toaster } from '@/components/shadcn/toaster';
import { PostHogProvider } from '@/providers/posthog';
import OnchainKitProvider from '@/providers/onchainkit';
import TwitchSubEndOfSupportModal from '@/components/TwitchSubEndOfSupportModal';
import Navbar, { navbarSpacer } from '@/components/Navbar';
import './globals.css';
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'osu!Collector | Find osu! beatmap collections',
  description: 'Find osu! beatmap collections and tournaments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <PostHogProvider>
        <OnchainKitProvider>
          <body id='app-root' className={cn('h-screen overflow-y-auto', inter.className)}>
            <Navbar />
            <div className={cn(navbarSpacer, 'flex flex-col')}>{children}</div>
            <Toaster />
            <TwitchSubEndOfSupportModal />
          </body>
        </OnchainKitProvider>
      </PostHogProvider>
    </html>
  );
}
