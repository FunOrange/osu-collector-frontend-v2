'use client';
import '../globals.css';
import ElectronSidebar from '@/app/electron/ElectronSidebar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/shadcn/dialog';
import { Toaster } from '@/components/shadcn/toaster';
import { SidebarProvider, SidebarTrigger } from '@/components/shadcn/sidebar';
import { cn } from '@/utils/shadcn-utils';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';

export default function Page() {
  const [notElectron, setNotElectron] = useState(false);
  useEffect(() => {
    if (!window.ipc) {
      setNotElectron(true);
    }
  }, []);

  return (
    <html lang='en'>
      <body>
        <SidebarProvider>
          <ElectronSidebar />
          <main className='w-full relative flex gap-2'>
            <SidebarTrigger className='absolute top-3 left-3' />
            <Tabs defaultValue='downloads' className='w-full'>
              <div className='p-1 bg-slate-900'>
                <TabsList className='ml-12 bg-slate-800 shadow-sm shadow-inset'>
                  <TabsTrigger value='downloads'>Downloads</TabsTrigger>
                  <TabsTrigger value='logs'>Logs</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='downloads'>Downloads</TabsContent>
              <TabsContent value='logs'>Logs</TabsContent>
            </Tabs>
          </main>
        </SidebarProvider>

        <Toaster />

        <Dialog open={false && notElectron} onOpenChange={setNotElectron}>
          <DialogContent>
            <DialogTitle>You are probably not supposed to be here</DialogTitle>
            <DialogDescription>
              This page is meant to be viewed from the osu!Collector desktop app, not from within a web browser.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </body>
    </html>
  );
}
