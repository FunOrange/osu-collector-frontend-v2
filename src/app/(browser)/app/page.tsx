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
            osu!lazer is now supported! Update the osu!Collector app to add collections and maps straight to osu!lazer.{' '}
            <Dialog>
              <DialogTrigger className='inline underline'>Learn more</DialogTrigger>.
              <DialogContent>
                <DialogHeader className='hidden'>
                  <DialogTitle>About osu!lazer support</DialogTitle>
                </DialogHeader>
                <div className='text-[14px]'>
                  <h2 className='mb-1 text-lg font-semibold text-slate-100'>What works with osu!lazer?</h2>
                  <div className='mb-3'>
                    <ul className='flex flex-col gap-2'>
                      <li>• Adding collections and tournament mappools to osu!lazer ✅</li>
                      <li>• Downloading maps and importing them into osu!lazer automatically ✅</li>
                      <li>• Skipping maps you already have in osu!lazer ✅</li>
                    </ul>
                  </div>

                  <h2 className='text-md mb-1 font-semibold text-slate-100'>Do I need to set anything up?</h2>
                  <div className='mb-3'>
                    No, osu!Collector finds osu!lazer automatically. When you open the app, choose{' '}
                    <b className='text-slate-300'>osu!lazer</b> as the game you play. You can change this at any time in
                    the app&apos;s settings, or when importing a collection.
                  </div>

                  <h2 className='text-md mb-1 font-semibold text-slate-100'>
                    I used to add collections to osu! stable, then import them into osu!lazer
                  </h2>
                  <div className='mb-3'>
                    That&apos;s no longer necessary. Switch to osu!lazer in the app&apos;s settings, and collections you
                    have already imported will be updated instead of duplicated.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {yellowStripes}
        </div>
        <div className='flex w-full justify-center bg-slate-700 px-2 py-16'>
          <div className='flex w-full max-w-[520px] flex-col items-center gap-8'>
            <DownloadDesktopClient />

            <div className='flex w-full max-w-6xl flex-col items-center gap-4 rounded py-6'>
              <h2 id='buy-now' className='text-center text-xl text-neutral-100'>
                Subscribe to osu!Collector for only <span className='font-bold text-white'>$1.99</span> / month!
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
