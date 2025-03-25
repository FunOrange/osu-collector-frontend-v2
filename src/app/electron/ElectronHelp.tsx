import { SidebarTrigger } from '@/components/shadcn/sidebar';

export default function ElectronHelp() {
  return (
    <main className='w-full relative'>
      <div className='h-12 flex items-center p-1 pl-2 bg-slate-900'>
        <SidebarTrigger className='' />
      </div>
    </main>
  );
}
