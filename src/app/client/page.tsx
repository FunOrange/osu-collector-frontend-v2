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

export const metadata: Metadata = {
  title: 'osu!Collector Desktop App',
  description: 'Download entire collections with seamless integration with osu!',
};

export default function DesktopClientPage() {
  return (
    <div className='flex flex-col gap-12'>
      <div className='w-full py-20 text-4xl text-center bg-black'>Support us to gain access to these features!</div>

      <div className='flex justify-center w-full py-16'>
        <div className='flex flex-col-reverse items-center justify-center w-full gap-4 lg:gap-16 lg:flex-row'>
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

      <div className='flex justify-center w-full py-16'>
        <div className='flex flex-col items-center justify-center w-full gap-4 lg:gap-16 lg:flex-row'>
          <Image width={624} height={345} src='/images/import.png' alt='Download collections' />
          <div className='max-w-xl text-center'>
            <div className='text-4xl font-semibold text-slate-50'>Import collections</div>
            <div className='mb-4 text-lg text-slate-400'>osu!Collector Desktop feature</div>
            <div className='text-lg text-slate-400'>Directly add collections to osu! with the click of a button</div>
          </div>
        </div>
      </div>

      <div className='flex justify-center w-full py-16'>
        <div className='flex flex-col-reverse items-center justify-center w-full gap-4 lg:gap-24 lg:flex-row'>
          <div className='max-w-xl text-center'>
            <div className='mb-2 text-4xl font-semibold text-slate-50 whitespace-nowrap'>Offload server costs</div>
            <div className='text-lg text-slate-400 '>
              I had to find some way to monetize this project so that it could continue running on its own. I figured
              something in similar vein to osu! supporter would be the best approach. Any support you give us is greatly
              appreciated!
            </div>
          </div>
          <HeartFill className='text-pink-500' style={{ width: '250px', height: '300px' }} />
        </div>
      </div>

      <div className='flex flex-col w-full'>
        <div className='flex flex-col items-center w-full text-black font-semibold'>
          {yellowStripes}
          <div className='text-center w-full gap-8 px-2 py-4 bg-yellow-500 text-sm text-yellow-900'>
            Collection integration with osu! Lazer is not currently supported. For workarounds{' '}
            <Dialog>
              <DialogTrigger className='inline underline'>click here</DialogTrigger>.
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About osu! Lazer</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <h2 className='text-lg font-semibold mb-1 text-slate-100'>Why is osu! Lazer not supported?</h2>
                  <div className='mb-3'>
                    <a href='https://github.com/ppy/osu/wiki/User-file-storage' className='underline text-blue-500'>
                      The way osu! lazer stores its files
                    </a>{' '}
                    makes it difficult for third-party programs to read/write to the game files.
                  </div>

                  <h2 className='text-lg font-semibold mb-1 text-slate-100'>
                    How can I add my missing maps and collections to osu! Lazer?
                  </h2>
                  <div className='mb-3'>
                    So far, the fastest way to get both your collections and maps from osu!Collector to osu!lazer is by
                    importing the collections/maps from osu! stable to osu!lazer by using the{' '}
                    <b className='text-slate-300'>Import function</b> in{' '}
                    <b className='text-slate-300'>Run setup wizard</b> on the settings.
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
          {yellowStripes}
        </div>
        <div className='flex justify-center w-full px-2 py-16 bg-slate-700'>
          <div className='w-full flex flex-col items-center gap-8 max-w-[520px]'>
            <DownloadDesktopClient />

            <div className='flex flex-col items-center w-full max-w-6xl py-6 rounded gap-4'>
              <h2 id='buy-now' className='text-2xl text-center text-white'>
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
    className='flex flex-col items-center w-full bg-yellow-500 h-2'
    style={{
      background: `repeating-linear-gradient(45deg, #fde047, #fde047 14px, #eab308 14px, #eab308 28px)`,
    }}
  />
);
