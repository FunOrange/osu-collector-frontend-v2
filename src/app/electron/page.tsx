'use client';
import '../globals.css';
import ElectronSidebar, { ElectronAppPage } from '@/app/electron/ElectronSidebar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/shadcn/dialog';
import { Toaster } from '@/components/shadcn/toaster';
import { SidebarProvider } from '@/components/shadcn/sidebar';
import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import ElectronHome from '@/app/electron/ElectronHome';
import ElectronSettings from '@/app/electron/ElectronSettings';

export default function ElectronApp() {
  const [notElectron, setNotElectron] = useState(false);
  useEffect(() => setNotElectron(!window.ipc), []);
  const [page, setPage] = useState(ElectronAppPage.Home);

  return (
    <html lang='en'>
      <body>
        <SidebarProvider>
          <ElectronSidebar page={page} setPage={setPage} />
          {match(page)
            .with(ElectronAppPage.Home, () => <ElectronHome />)
            .with(ElectronAppPage.Settings, () => <ElectronSettings />)
            .exhaustive()}
        </SidebarProvider>

        <>
          <Toaster />

          <Dialog open={notElectron} onOpenChange={(open) => setNotElectron(open)}>
            <DialogContent>
              <DialogTitle>You are probably not supposed to be here</DialogTitle>
              <DialogDescription>
                This page is meant to be viewed from the osu!Collector app, not from within a web browser. You may poke
                around, but nothing will work.
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </>
      </body>
    </html>
  );
}
