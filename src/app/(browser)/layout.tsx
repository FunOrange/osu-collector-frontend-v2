import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/utils/shadcn-utils';
import { Toaster } from '@/components/shadcn/toaster';
import { PostHogProvider } from '@/providers/posthog';
import TwitchSubEndOfSupportModal from '@/components/TwitchSubEndOfSupportModal';
import Navbar from '@/components/Navbar';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'osu!Collector | Find osu! beatmap collections',
  description: 'Find osu! beatmap collections and tournaments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <PostHogProvider>
        <body id='app-root' className={cn('mt-14 h-[calc(100vh-56px)]', inter.className)}>
          <Navbar />

          <div id='page-content' className={cn('flex flex-col')}>
            {children}
          </div>

          <Toaster />
          <TwitchSubEndOfSupportModal />
        </body>
      </PostHogProvider>
    </html>
  );
}
