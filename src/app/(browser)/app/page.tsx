import PaymentOptions from '@/components/pages/client/PaymentOptions';
import Image from 'next/image';
import { HeartFill } from 'react-bootstrap-icons';
import DownloadDesktopClient from '@/components/pages/client/DownloadDesktopClient';
import { Metadata } from 'next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import OsuCollectorAppDemo from '@/app/(browser)/app/OsuCollectorAppDemo';

export const metadata: Metadata = {
  title: 'osu!Collector Desktop App',
  description: 'Download entire collections with seamless integration with osu!',
};

export default function DesktopAppPage() {
  return (
    <div className='flex flex-col gap-12'>
      <OsuCollectorAppDemo />
      <div className='flex w-full justify-center py-16'>
        <div className='flex w-full flex-col-reverse items-center justify-center gap-4 lg:flex-row lg:gap-16'>
          <div className='max-w-xl text-center'>
            <div className='text-4xl font-semibold text-slate-50'>Download entire collections</div>
            <div className='mb-4 text-lg text-slate-400'>osu!Collector Desktop feature</div>
            <div className='text-lg text-slate-400'>Download all the beatmaps in a collection with one click.</div>
            <div className='text-lg text-slate-400'>
              Downloads are hosted on our own servers.
              <br />
              No rate limits, stupid fast download speeds.
            </div>
          </div>
          <Image width={624} height={455} src='/images/downloads.png' alt='Download collections' />
        </div>
      </div>
      <div className='flex w-full justify-center py-16'>
        <div className='flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-16'>
          <Image width={624} height={345} src='/images/import.png' alt='Download collections' />
          <div className='max-w-xl text-center'>
            <div className='text-4xl font-semibold text-slate-50'>Import collections</div>
            <div className='mb-4 text-lg text-slate-400'>osu!Collector Desktop feature</div>
            <div className='text-lg text-slate-400'>Directly add collections to osu! with the click of a button</div>
          </div>
        </div>
      </div>
      <div className='flex w-full justify-center py-16'>
        <div className='flex w-full flex-col-reverse items-center justify-center gap-4 lg:flex-row lg:gap-24'>
          <div className='max-w-xl text-center'>
            <div className='mb-2 whitespace-nowrap text-4xl font-semibold text-slate-50'>Offload server costs</div>
            <div className='text-lg text-slate-400'>
              I had to find some way to monetize this project so that it could continue running on its own. I figured
              something in similar vein to osu! supporter would be the best approach. Any support you give us is greatly
              appreciated!
            </div>
          </div>
          <HeartFill className='text-pink-500' style={{ width: '250px', height: '300px' }} color='currentColor' />
        </div>
      </div>
      <div className='flex w-full flex-col'>
        <div className='flex w-full flex-col items-center font-semibold text-black'>
          {yellowStripes}
          <div className='w-full gap-8 bg-yellow-500 px-2 py-4 text-center text-sm text-yellow-900'>
            Collection integration with osu! Lazer is not currently supported. For workarounds{' '}
            <Dialog>
              <DialogTrigger className='inline underline'>click here</DialogTrigger>.
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About osu! Lazer</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <h2 className='mb-1 text-lg font-semibold text-slate-100'>
                    Why does osu! Lazer have limited support?
                  </h2>
                  <div className='mb-3'>
                    <a href='https://github.com/ppy/osu/wiki/User-file-storage' className='text-blue-500 underline'>
                      The way osu! lazer stores its files
                    </a>{' '}
                    makes it difficult for third-party programs to read/write to the game files.
                  </div>

                  <h2 className='mb-1 text-lg font-semibold text-slate-100'>What still works with osu! Lazer?</h2>
                  <div className='mb-3'>
                    <ul className='flex flex-col gap-2'>
                      <li>
                        • Downloading maps ✅ <br />{' '}
                        <span className='pl-5'>The .osz files will just download to a folder that you specify</span>
                      </li>
                      <li>• Intelligently skipping maps you already have downloaded ❌</li>
                      <li>• Importing collection into game ❌</li>
                    </ul>
                  </div>

                  <h2 className='text-md mb-1 font-semibold text-slate-100'>
                    How can I add my missing maps and collections to osu! Lazer?
                  </h2>
                  <div className='mb-3'>
                    So far, the fastest way to get both your collections and maps from osu!Collector to osu!lazer is by
                    importing the collections/maps from osu! stable to osu!lazer by using the{' '}
                    <b className='text-slate-300'>Import function</b> in{' '}
                    <b className='text-slate-300'>Run setup wizard</b> on the settings.
                  </div>
                  <div className='mb-5 flex items-center gap-2'>
                    <div className='rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white'>
                      osu!Collector App
                    </div>
                    <div className='text-xl'> → </div>
                    <div className='rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white'>
                      osu! Stable
                    </div>
                    <div className='relative flex justify-center'>
                      <span className='text-xl'>→</span>
                      <div className='absolute top-10 whitespace-nowrap text-xs text-white'>
                        via Lazer&apos;s Run Setup Wizard
                      </div>
                    </div>
                    <div className='rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-white'>
                      osu! Lazer
                    </div>
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
          {yellowStripes}
        </div>
        <div className='flex w-full justify-center bg-slate-700 px-2 py-16'>
          <div className='flex w-full max-w-[520px] flex-col items-center gap-8'>
            <DownloadDesktopClient />

            <div className='flex w-full max-w-6xl flex-col items-center gap-4 rounded py-6'>
              <h2 id='buy-now' className='text-center text-2xl text-white'>
                Buy osu!Collector Desktop now!
              </h2>
              <PaymentOptions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const yellowStripes = (
  <div
    className='flex h-2 w-full flex-col items-center bg-yellow-500'
    style={{
      background: `repeating-linear-gradient(45deg, #fde047, #fde047 14px, #eab308 14px, #eab308 28px)`,
    }}
  />
);
