import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';

export default function ElectronHome() {
  return (
    <main className='w-full relative'>
      <SidebarTrigger className='absolute top-[6px] left-2' />
      <Tabs defaultValue='downloads' className='w-full'>
        <div className='p-1 bg-slate-900'>
          <TabsList className='ml-12 bg-slate-800 shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]'>
            <TabsTrigger value='downloads'>Downloads</TabsTrigger>
            <TabsTrigger value='logs'>Logs</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='downloads'>Downloads</TabsContent>
        <TabsContent value='logs'>Logs</TabsContent>
      </Tabs>
    </main>
  );
}
