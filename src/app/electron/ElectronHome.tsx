import ElectronDownloads from '@/app/electron/ElectronDownloads';
import ElectronLogs from '@/app/electron/ElectronLogs';
import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import useClientValue from '@/hooks/useClientValue';

// TODO: When adding a new collection, review the following steps:
// 1. Close osu! if it's open
// 2. Merge collection into collection.db
// 3. Queue downloads for all selected beatmaps

export default function ElectronHome() {
  const isClient = useClientValue(() => true, false);
  return (
    <main className='relative h-full w-full'>
      <SidebarTrigger className='absolute left-2 top-[6px]' />
      <Tabs defaultValue='downloads' className='flex h-full w-full flex-col'>
        <div className='bg-slate-900 p-1'>
          <TabsList className='ml-12 gap-1 bg-slate-800 shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]'>
            <TabsTrigger value='downloads'>Downloads</TabsTrigger>
            <TabsTrigger value='logs'>Logs</TabsTrigger>
          </TabsList>
        </div>
        {(() => {
          if (!isClient) return null;
          return (
            <>
              <TabsContent value='downloads' className='m-0 h-full min-h-0'>
                <ElectronDownloads />
              </TabsContent>
              <TabsContent value='logs' className='m-0 h-full'>
                <ElectronLogs />
              </TabsContent>
            </>
          );
        })()}
      </Tabs>
    </main>
  );
}
