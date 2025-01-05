import PaymentOptions from '@/components/pages/client/PaymentOptions';
import Image from 'next/image';
import { HeartFill } from 'react-bootstrap-icons';
import DownloadDesktopClient from '@/components/pages/client/DownloadDesktopClient';
import { Metadata } from 'next';

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

      <div className='flex flex-col items-center w-full gap-8 px-2 py-16 bg-slate-700'>
        <DownloadDesktopClient />

        <div className='w-full max-w-6xl py-6 rounded'>
          <h2 className='text-2xl text-center'>Two ways to support us!</h2>
          <div className='mb-2 text-center'>
            Please note that supporting us with both methods at the same time{' '}
            <b>will not extend your supporter status!</b> Please use only one method.
          </div>

          <PaymentOptions />
        </div>
      </div>
    </div>
  );
}
