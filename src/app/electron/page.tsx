'use client';
import '../globals.css';
import ElectronNavbar, { navbarSpacer } from '@/app/electron/ElectronNavbar';
import { Toaster } from '@/components/shadcn/toaster';
import { IpcRenderer } from '@/entities/ipc';
import { cn } from '@/utils/shadcn-utils';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import {} from 'next/router';
import { useEffect, useRef } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Page() {
  const router = useRouter();
  const ipcRendererRef = useRef<IpcRenderer | null>(null);
  const ipcRenderer = ipcRendererRef.current;

  useEffect(() => {
    if (typeof window.require !== 'function') {
      router.push('/not-found');
      return;
    }
    ipcRendererRef.current = window.require('electron').ipcRenderer;
    if (!ipcRendererRef.current) {
      router.push('/not-found');
      return;
    }

    // TODO: handle event listeners
  }, []);

  return (
    <html lang='en'>
      <body id='app-root' className={cn('h-screen overflow-y-auto', inter.className)}>
        <ElectronNavbar />
        <div className={cn(navbarSpacer, 'flex flex-col')}>Hello</div>
        <Toaster />
      </body>
    </html>
  );
}
