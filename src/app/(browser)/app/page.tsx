import PaymentOptions from '@/components/pages/client/PaymentOptions';
import Image from 'next/image';
import { HeartFill } from 'react-bootstrap-icons';
import DownloadDesktopClient from '@/components/pages/client/DownloadDesktopClient';
import { Metadata } from 'next';
import OsuCollectorAppDemo, { featuresSectionId, getTheAppSectionId } from '@/app/(browser)/app/OsuCollectorAppDemo';

export const metadata: Metadata = {
  title: 'osu!Collector Desktop App',
  description: 'Download entire collections with seamless integration with osu!',
};

export default function DesktopAppPage() {
  return (
    <div className='flex flex-col gap-12'>
      <OsuCollectorAppDemo />
      <div id={featuresSectionId} className='flex w-full scroll-mt-14 justify-center px-4 py-8 md:py-16'>
        <div className='flex w-full flex-col-reverse items-center justify-center gap-4 lg:flex-row lg:gap-16'>
          <div className='max-w-xl text-center'>
            <div className='text-3xl font-semibold text-slate-50 sm:text-4xl'>Download entire collections</div>
            <div className='mb-4 text-lg text-slate-400'>osu!Collector Desktop feature</div>
            <div className='text-lg text-slate-400'>Download all the beatmaps in a collection with one click.</div>
            <div className='text-lg text-slate-400'>
              Downloads are hosted on our own servers.
              <br />
              No rate limits, stupid fast download speeds.
            </div>
          </div>
          <Image
            width={624}
            height={455}
            className='h-auto w-full max-w-[624px]'
            src='/images/downloads.png'
            alt='Download collections'
          />
        </div>
      </div>
      <div className='flex w-full justify-center px-4 py-8 md:py-16'>
        <div className='flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-16'>
          <Image
            width={624}
            height={345}
            className='h-auto w-full max-w-[624px]'
            src='/images/import.png'
            alt='Import collections'
          />
          <div className='max-w-xl text-center'>
            <div className='text-3xl font-semibold text-slate-50 sm:text-4xl'>Import collections</div>
            <div className='mb-4 text-lg text-slate-400'>osu!Collector Desktop feature</div>
            <div className='text-lg text-slate-400'>Directly add collections to osu! with the click of a button</div>
          </div>
        </div>
      </div>
      <div className='flex w-full justify-center px-4 py-8 md:py-16'>
        <div className='flex w-full flex-col-reverse items-center justify-center gap-4 lg:flex-row lg:gap-24'>
          <div className='max-w-xl text-center'>
            <div className='mb-2 text-3xl font-semibold text-slate-50 sm:text-4xl'>Offload server costs</div>
            <div className='text-lg text-slate-400'>
              I had to find some way to monetize this project so that it could continue running on its own. I figured
              something in similar vein to osu! supporter would be the best approach. Any support you give us is greatly
              appreciated!
            </div>
          </div>
          <HeartFill className='h-[180px] w-[150px] text-pink-500 lg:h-[300px] lg:w-[250px]' color='currentColor' />
        </div>
      </div>
      <div id={getTheAppSectionId} className='flex w-full scroll-mt-14 flex-col'>
        <div className='flex w-full flex-col items-center'>
          <div className='w-full border-y border-emerald-400/40 bg-emerald-600 px-4 py-4 text-center text-sm font-medium text-emerald-50'>
            <span className='mr-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700'>
              New
            </span>
            <span className='font-semibold text-white'>osu!lazer is now supported!</span> Update the osu!Collector app
            to add collections and maps straight to osu!lazer.
          </div>
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
