import { UserNav } from '@/components/UserNav';
import { List } from 'react-bootstrap-icons';
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
import UploadButton from '@/components/UploadButton';

export const navbarHeight = 'h-14';
export const navbarHeightPx = 56;
export const screenHeightMinusNavbar = 'h-[calc(100vh-56px)]';
export const navbarSpacer = 'pt-14';

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

export default function Navbar() {
  return (
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
  );
}
