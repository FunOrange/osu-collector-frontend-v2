import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserNav } from '@/components/UserNav';
import { List, Search } from 'react-bootstrap-icons';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/shadcn/alert-dialog';
import { buttonVariants } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import NavbarSearch from '@/components/NavbarSearch';
import { Toaster } from '@/components/shadcn/toaster';
import UploadButton from '@/components/UploadButton';
import { PostHogProvider } from '@/providers/posthog';
import TwitchSubEndOfSupportModal from '@/components/TwitchSubEndOfSupportModal';

const inter = Inter({ subsets: ['latin'] });

const navbarHeight = 'h-14';
const navbarSpacer = 'pt-14';

export const metadata: Metadata = {
  title: 'osu!Collector | Find osu! beatmap collections',
  description: 'Find osu! beatmap collections and tournaments',
};

const navItems = [
  { label: 'Collections', href: '/all' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'App', href: '/client' },
  { label: 'Users', href: '/users' },
];

const glass = {
  background: 'rgba(22, 25, 31, 0.8)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8.5px)',
  borderBottom: '1px solid rgba(35, 41, 53)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body id='app-root' className={cn('h-screen overflow-y-auto', inter.className)}>
        <PostHogProvider>
          <div
            className={cn(
              'fixed top-0 z-40 flex flex-colshadow-xl justify-between w-full px-1 md:px-4 md:pr-2',
              navbarHeight,
            )}
            style={glass}
          >
            <div className='flex items-center'>
              <div className='block md:hidden'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className='px-2 py-1 text-sm transition rounded hover:bg-slate-600'>
                      <List size={30} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>osu!Collector</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className='flex flex-col gap-1'>
                      {[{ href: '/', label: 'Home' }, ...navItems].map(({ label, href }, i) => (
                        <Link href={href} key={i}>
                          <AlertDialogAction className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}>
                            {label}
                          </AlertDialogAction>
                        </Link>
                      ))}
                    </div>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Link href='/'>
                <div className='flex items-center px-2 py-3 cursor-pointer'>
                  osu!
                  <span className='font-semibold text-gray-50'>Collector</span>
                </div>
              </Link>
              <nav className='items-center hidden mx-6 space-x-4 lg:space-x-6 md:flex'>
                {navItems.map(({ label, href }, i) => (
                  <Link href={href} className='text-sm font-medium transition-colors hover:text-primary' key={i}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className='flex items-center gap-2'>
              <NavbarSearch />
              <UploadButton className='hidden sm:flex' />
              <UserNav />
            </div>
          </div>
        </PostHogProvider>
        <div className={cn(navbarSpacer, 'flex flex-col')}>{children}</div>
        <Toaster />
        <TwitchSubEndOfSupportModal />
      </body>
    </html>
  );
}
