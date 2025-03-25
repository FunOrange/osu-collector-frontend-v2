'use client';
import '../globals.css';
import ElectronSidebar, { ElectronAppPage } from '@/app/electron/ElectronSidebar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/shadcn/dialog';
import { Toaster } from '@/components/shadcn/toaster';
import { SidebarProvider } from '@/components/shadcn/sidebar';
import { useState } from 'react';
import useClientValue from '@/hooks/useClientValue';
import { match } from 'ts-pattern';
import ElectronHome from '@/app/electron/ElectronHome';
import ElectronHelp from '@/app/electron/ElectronHelp';
import ElectronSettings from '@/app/electron/ElectronSettings';

export default function ElectronApp() {
  const notElectron = useClientValue(() => !window.ipc, false);
  const [page, setPage] = useState(ElectronAppPage.Home);

  return (
    <html lang='en'>
      <body>
        <SidebarProvider>
          <ElectronSidebar page={page} setPage={setPage} />
          {match(page)
            .with(ElectronAppPage.Home, () => <ElectronHome />)
            .with(ElectronAppPage.Help, () => <ElectronHelp />)
            .with(ElectronAppPage.Settings, () => <ElectronSettings />)
            .exhaustive()}
        </SidebarProvider>

        <>
          <Toaster />

          <Dialog open={false && notElectron}>
            <DialogContent>
              <DialogTitle>You are probably not supposed to be here</DialogTitle>
              <DialogDescription>
                This page is meant to be viewed from the osu!Collector desktop app, not from within a web browser.
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </>
      </body>
    </html>
  );
}
