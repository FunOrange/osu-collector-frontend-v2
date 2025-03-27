import ElectronDownloads from '@/app/electron/ElectronDownloads';
import ElectronLogs from '@/app/electron/ElectronLogs';
import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';

// TODO: When adding a new collection, review the following steps:
// 1. Close osu! if it's open
// 2. Merge collection into collection.db
// 3. Queue downloads for all selected beatmaps

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
        {(() => {
          if (typeof window === 'undefined') return null;
          return (
            <>
              <TabsContent value='downloads'>
                <ElectronDownloads />
              </TabsContent>
              <TabsContent value='logs'>
                <ElectronLogs />
              </TabsContent>
            </>
          );
        })()}
      </Tabs>
    </main>
  );
}
