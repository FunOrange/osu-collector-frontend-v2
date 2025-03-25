import { Button } from '@/components/shadcn/button';
import { Checkbox } from '@/components/shadcn/checkbox';
import { Input } from '@/components/shadcn/input';
import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { cn } from '@/utils/shadcn-utils';

export default function ElectronSettings() {
  return (
    <main className='w-full'>
      <section className='h-12 flex justify-between items-center gap-2 px-2 py-1 bg-slate-900'>
        <SidebarTrigger />
        <div className='flex items-center gap-1 p-1'>
          <Button variant='ghost' size='sm' className='text-slate-400 hover:bg-slate-500/30'>
            Open log folder
          </Button>
          <Button variant='ghost' size='sm' className='text-slate-400 hover:bg-slate-500/30'>
            Open DevTools
          </Button>
          <Button variant='ghost' size='sm' className='text-slate-400 hover:bg-slate-500/30'>
            Special login
          </Button>
        </div>
      </section>

      <div className='p-4 flex flex-col gap-4 max-w-screen-md w-full'>
        <div>
          <h3 className='text-white mb-1'>File Paths</h3>
          <hr className='border-white/20' />
        </div>

        <div className='flex flex-col gap-1'>
          <div className='text-sm text-white'>osu! install folder</div>
          <Input className='w-full' placeholder='C:\Program Files\osu!' />
          <div className='text-xs text-slate-400'>
            This is where osu! is installed. This folder should contain osu!.exe
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='text-sm text-white'>osu! songs folder</div>
          <Input className='w-full' placeholder='C:\Program Files\osu!\Songs' />
          <div className='text-xs text-slate-400'>
            osu!Collector will download to this location by default. It also checks these folders to determine if you
            already have beatmaps downloaded. Please include all symlinked folders if applicable.
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='text-sm text-white'>download folder</div>
          <Input className='w-full' placeholder='C:\Program Files\osu!\Songs' />
          <div className='text-xs text-slate-400'>
            If left blank, osu!Collector will download .osz files to the osu! songs folder by default.
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='text-white mb-1'>Importing Collections</h3>
          <hr className='border-white/20' />
        </div>

        <div className='flex flex-col gap-1'>
          <div className='text-sm text-white'>imported collection name</div>
          <Input className='w-full' placeholder='o!c - ${uploader} - ${collectionName}' />
          <div className='text-xs text-slate-400'>
            When importing a collection to osu, this name template will be used.
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='text-white mb-1'>Operating System Integration</h3>
          <hr className='border-white/20' />
        </div>

        <div
          className={cn(
            'flex flex-col gap-1 self-start p-2 rounded',
            'transition-colors cursor-pointer hover:bg-slate-700',
          )}
        >
          <div className='flex items-center gap-2'>
            <Checkbox id='minimize-to-system-tray-checkbox' />
            <label htmlFor='minimize-to-system-tray-checkbox' className='text-sm text-white'>
              minimize to system tray
            </label>
          </div>
          <div className='text-xs text-slate-400'>
            When closing the window, the app will minimize to the system tray instead of closing.
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col gap-1 self-start p-2 rounded',
            'transition-colors cursor-pointer hover:bg-slate-700',
          )}
        >
          <div className='flex items-center gap-2'>
            <Checkbox id='desktop-notifications-checkbox' />
            <label htmlFor='desktop-notifications-checkbox' className='text-sm text-white'>
              desktop notifications
            </label>
          </div>
          <div className='text-xs text-slate-400'>
            When a collection has been completely downloaded, a desktop notification will be shown.
          </div>
        </div>
      </div>
    </main>
  );
}
