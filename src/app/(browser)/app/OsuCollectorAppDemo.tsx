'use client';
import Image from 'next/image';
import { navbarHeightPx } from '@/components/Navbar';
import { useRef, useState } from 'react';
import { cn } from '@/utils/shadcn-utils';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/shadcn/button';

const demoAspectRatio = '1906 / 802';

export const getTheAppSectionId = 'get-the-app';
export const featuresSectionId = 'features';

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function OsuCollectorAppDemo() {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}

function CallToAction({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className='flex flex-wrap justify-center gap-3'>
        <Button variant='important' size='lg' onClick={() => scrollToSection(getTheAppSectionId)}>
          Get the app
        </Button>
        <Button
          variant='outline'
          size='lg'
          className='text-slate-200'
          onClick={() => scrollToSection(featuresSectionId)}
        >
          See features
        </Button>
      </div>
      <div className='text-sm text-slate-400'>
        Only <span className='font-semibold text-slate-200'>$1.99</span> / month. Windows, Mac and Linux.
      </div>
      <button
        className='flex flex-col items-center text-sm text-slate-400 transition-colors hover:text-slate-200'
        onClick={() => scrollToSection(featuresSectionId)}
      >
        Scroll for features, downloads and pricing
        <ChevronDown className='h-8 w-8 animate-bounce' />
      </button>
    </div>
  );
}

/** Small screens: a plain video player the user controls, followed by the CTA. */
function MobileHero() {
  return (
    <section className='flex flex-col items-center gap-6 px-4 pb-4 pt-8 md:hidden'>
      <div className='text-center'>
        <h1 className='text-3xl font-semibold text-slate-50'>osu!Collector App</h1>
        <div className='text-slate-400'>The best way to collect beatmaps.</div>
      </div>
      <video
        controls
        playsInline
        muted
        loop
        preload='metadata'
        poster='/images/osu-collector-demo.png'
        className='w-full rounded bg-black shadow-lg'
        style={{ aspectRatio: demoAspectRatio }}
        src='/images/osu-collector-demo.mp4'
      />
      <CallToAction />
    </section>
  );
}

/** Larger screens: interactive "Add to osu!" demo, followed by the CTA. */
function DesktopHero() {
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
      className={cn('relative h-auto w-full transition-[opacity]', isPlaying && 'pointer-events-none opacity-0')}
      style={{ aspectRatio: demoAspectRatio }}
    >
      <div className='absolute z-10 grid h-full w-full grid-cols-2'>
        <div />
        <div className='flex flex-col justify-between'>
          <div />
          <div className='p-6 lg:p-10'>
            <h1 className='text-shadow-lg text-shadow-white text-lg font-medium text-white lg:text-5xl'>
              osu!Collector App
            </h1>
            <div className='lg:text-xl'>The best way to collect beatmaps.</div>
          </div>
        </div>
      </div>
      <button
        className='absolute z-10 rounded-sm bg-slate-600 text-white transition-[transform,filter] hover:scale-110 hover:brightness-125'
        style={{
          top: '38%',
          right: '55.2%',
          width: '12.7%',
          minWidth: '68px',
          height: '4.7%',
          minHeight: '20px',
          fontSize: 'calc(max(0.7vw,11px))',
        }}
        onClick={() => {
          setIsPlaying(true);
          videoRef.current?.play();
        }}
      >
        Add to osu!
      </button>
      <div
        className='absolute z-10 flex animate-arrow-nudge items-center'
        style={{ top: '38%', left: '50%', width: '45%', height: '4.7%', fontSize: '5%' }}
      >
        <div className='absolute flex w-full items-center gap-2 text-sm lg:text-xl'>
          <ArrowLeft />
          Click the &quot;Add to osu!&quot; button to see a demo!
        </div>
      </div>
      <Image
        fill
        className='object-contain brightness-50'
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
          aspectRatio: demoAspectRatio,
        }}
      />
      <div className={cn('absolute', !isPlaying && 'hidden')} style={{ aspectRatio: demoAspectRatio }}>
        <video ref={videoRef} loop muted playsInline className='w-full' src='/images/osu-collector-demo.mp4' />
      </div>
    </>
  );

  return (
    <section
      className='relative hidden w-full flex-col md:flex'
      style={{ height: `calc(100vh - ${navbarHeightPx}px)` }}
    >
      {background}
      <div className='relative flex min-h-0 w-full flex-1 items-center justify-center'>
        <div className='flex aspect-video max-h-full w-full items-center justify-center'>
          <div className='relative flex aspect-video h-full items-center justify-center'>
            {isPlaying && (
              <div className='absolute top-8 flex w-full flex-col items-center justify-center text-center text-3xl font-light text-white duration-1000 animate-in fade-in'>
                Subscribe to download and import collections with ease!
              </div>
            )}
            <div className='absolute col-span-full flex h-full w-full items-center justify-center' style={{ left: -1 }}>
              {previewImage}
              {videoPlayer}
            </div>
          </div>
        </div>
      </div>
      <CallToAction className='relative z-10 pb-4 pt-2' />
    </section>
  );
}
