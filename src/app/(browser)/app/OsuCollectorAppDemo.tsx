'use client';
import Image from 'next/image';
import { navbarHeightPx } from '@/components/Navbar';
import { useRef, useState } from 'react';
import { cn } from '@/utils/shadcn-utils';
import { ArrowLeft } from 'lucide-react';

export default function OsuCollectorAppDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const background = (
    <div
      className={cn(
        'absolute grid h-full w-full grid-cols-2 transition-colors',
        !isPlaying && 'bg-black',
        isPlaying && 'divide-x bg-slate-900',
      )}
    >
      <div />
      <div />
    </div>
  );

  const previewImage = (
    <div
      className={cn(
        'absolute relative h-auto w-full transition-[opacity]',
        isPlaying && 'pointer-events-none opacity-0',
      )}
      style={{ aspectRatio: '1906 / 802' }}
    >
      <div className='absolute z-10 grid h-full w-full grid-cols-2'>
        <div />
        <div className='flex flex-col justify-between'>
          <div />
          <div className='p-2 sm:p-4 md:p-6 lg:p-10'>
            <h1 className='text-shadow-lg text-shadow-white text-xs font-medium text-white sm:text-lg lg:text-5xl'>
              osu!Collector App
            </h1>
            <div className='hidden sm:block lg:text-xl'>The best way to collect beatmaps.</div>
          </div>
        </div>
      </div>
      <button
        className='absolute z-10 rounded-sm bg-slate-600 text-white transition-all hover:scale-110 hover:brightness-125'
        style={{
          top: '38%',
          left: '32.2%',
          width: '12.7%',
          minWidth: '60px',
          height: '4.7%',
          minHeight: '20px',
          fontSize: '5%',
        }}
        onClick={() => {
          setIsPlaying(true);
          videoRef.current?.play();
        }}
      >
        Add to osu!
      </button>
      <div
        className='animate-arrow-nudge z-5 absolute flex items-center'
        style={{ top: '38%', left: '50%', width: '45%', height: '4.7%', fontSize: '5%' }}
      >
        <div className='sm:text-md absolute flex w-full items-center gap-2 text-xs lg:text-xl'>
          <ArrowLeft />
          Click the &quot;Add to osu!&quot; button to see a demo!
        </div>
      </div>
      <Image
        fill
        className='brightness-50'
        objectFit='contain'
        sizes='100vw'
        src='/images/osu-collector-demo.png'
        alt='osu!Collector demo'
      />
    </div>
  );

  const videoPlayer = (
    <>
      <div
        className={cn('absolute z-10 w-full', !isPlaying && 'hidden')}
        style={{
          borderLeft: '1px solid #0f172a',
          boxShadow: 'inset 0 0 20px 1px #0f172a',
          aspectRatio: '1906 / 802',
        }}
      />
      <div className={cn('absolute', !isPlaying && 'hidden')} style={{ aspectRatio: '1906 / 802' }}>
        <video ref={videoRef} loop muted playsInline className='w-full' src='/images/osu-collector-demo.mp4' />
      </div>
    </>
  );
  return (
    <div
      className='relative flex w-full items-center justify-center'
      style={{ height: `calc(100vh - ${navbarHeightPx}px)` }}
    >
      {background}
      <div className='flex aspect-video max-h-full w-full items-center justify-center'>
        <div className='relative flex aspect-video h-full items-center justify-center'>
          <div
            className='absolute relative col-span-full flex h-full w-full items-center justify-center'
            style={{ left: -1 }}
          >
            {previewImage}
            {videoPlayer}
          </div>
        </div>
      </div>
    </div>
  );
}
