import { Button } from '@/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
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
import { User2 } from 'lucide-react';
import { ChevronUp, Gear, House, QuestionCircle } from 'react-bootstrap-icons';

export enum ElectronAppPage {
  Home = 'home',
  Help = 'help',
  Settings = 'settings',
}

const items = [
  {
    title: 'Home',
    page: ElectronAppPage.Home,
    icon: <House className='w-4 h-4' />,
  },
  {
    title: 'How to',
    page: ElectronAppPage.Help,
    icon: <QuestionCircle className='w-4 h-4' />,
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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>osu!Collector App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton isActive={page === item.page} onClick={() => setPage(item.page)}>
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
            {true ? (
              <Button variant='important' size='lg' className='w-full gap-2 justify-start'>
                <User2 className='w-5 h-5' />
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Username
                    <ChevronUp className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='top' className='w-[--radix-popper-anchor-width]'>
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <div className='text-xs text-slate-500 dark:text-slate-400'>version: 2.0.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}
