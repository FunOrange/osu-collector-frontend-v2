'use client';
import '../globals.css';
import ElectronNavbar, { navbarSpacer } from '@/app/electron/ElectronNavbar';
import { Button } from '@/components/shadcn/button';
import { Toaster } from '@/components/shadcn/toaster';
import { cn } from '@/utils/shadcn-utils';

export default function Page() {
  const pathJoin = async () => {
    const path = await window.ipc.pathJoin('/Users/funor/Downloads', 'test.txt');
    console.log(path);
  };

  const openDevTools = async () => {
    await window.ipc.openDevTools();
  };

  return (
    <html lang='en'>
      <body>
        <ElectronNavbar />
        <div className={cn(navbarSpacer, 'flex flex-col')}>
          <Button onClick={pathJoin}>pathJoin</Button>
          <Button onClick={openDevTools}>openDevTools</Button>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
