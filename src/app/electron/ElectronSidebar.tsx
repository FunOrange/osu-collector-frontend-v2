import ElectronLogin from '@/app/electron/ElectronLogin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/shadcn/sidebar';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useUser } from '@/services/osu-collector-api-hooks';
import { cn } from '@/utils/shadcn-utils';
import { Gear, House } from 'react-bootstrap-icons';

export enum ElectronAppPage {
  Home = 'home',
  Settings = 'settings',
}

const items = [
  {
    title: 'Home',
    page: ElectronAppPage.Home,
    icon: <House className='w-4 h-4' />,
  },
  {
    title: 'Settings',
    page: ElectronAppPage.Settings,
    icon: <Gear className='w-4 h-4' />,
  },
];

export interface ElectronSidebarProps {
  page: ElectronAppPage;
  setPage: React.Dispatch<React.SetStateAction<ElectronAppPage>>;
}
export default function ElectronSidebar({ page, setPage }: ElectronSidebarProps) {
  const { user, isLoading } = useUser();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>osu!Collector App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton isActive={page === item.page} onClick={() => setPage(item.page)} className='py-6'>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='flex flex-col items-center'>
        <SidebarMenu>
          <SidebarMenuItem>
            <Skeleton loading={isLoading} className='w-full h-10'>
              {user ? (
                <Button
                  variant='ghost'
                  className={cn(
                    'w-full px-2 py-2 gap-2 justify-start cursor-default',
                    user.paidFeaturesAccess && 'bg-pink-500/90 hover:bg-pink-500 text-white',
                  )}
                >
                  <Avatar className='w-6 h-6'>
                    <AvatarImage src={user.osuweb.avatar_url} alt='avatar' />
                    <AvatarFallback>{user.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='line-clamp-1'>{user.osuweb.username}</div>
                </Button>
              ) : (
                <ElectronLogin />
              )}
            </Skeleton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className='text-xs text-slate-500 dark:text-slate-400'>version: 2.0.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}
