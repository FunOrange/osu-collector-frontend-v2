import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import { PlusIcon } from 'lucide-react';

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

export default function ElectronNavbar() {
  return (
    <div
      className={cn(
        'fixed top-0 z-40 flex flex-colshadow-xl justify-between w-full px-1 md:px-4 md:pr-2',
        navbarHeight,
      )}
      style={glass}
    >
      <div className='flex items-center gap-2'>
        <Button className='gap-2 py-2' icon={<PlusIcon className='w-5 h-5' />}>
          Collection
        </Button>
        <Button className='gap-2 py-2' icon={<PlusIcon className='w-5 h-5' />}>
          Tournament
        </Button>
      </div>

      <div className='flex items-center gap-2'>
        <UserNav />
      </div>
    </div>
  );
}
