'use client';
import { useState } from 'react';
import { Clipboard } from 'react-bootstrap-icons';
import Image from 'next/image';
import { match } from 'ts-pattern';
import { secondsToHHMMSS } from '@/utils/date-time-utils';
import { bpmToColor, getContrastColor, starToColor } from '@/utils/theme-utils';
import * as V1 from '@/shared/entities/v1';
import * as V2 from '@/shared/entities/v2';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import BeatmapsetCardPlayButton from '@/components/pages/collections/[collectionId]/BeatmapsetCardPlayButton';
import { cn } from '@/utils/shadcn-utils';

export interface BeatmapsetCardCardProps {
  beatmapset: V1.Beatmapset | V2.Beatmapset;
  beatmaps: V1.Beatmap[];
}
export default function BeatmapsetCard({ beatmapset, beatmaps }: BeatmapsetCardCardProps) {
  const [showCopiedToClipboard, setShowCopiedToClipboard] = useState<number[]>([]);
  const copyToClipboard = (beatmapId: number) => {
    navigator.clipboard.writeText(beatmapId.toString());
    setShowCopiedToClipboard((prev) => [...prev, beatmapId]);
    setTimeout(() => setShowCopiedToClipboard((prev) => prev.filter((id) => id !== beatmapId)), 2000);
  };

  const [imageError, setImageError] = useState(false);
  const slimcoverfallback = '/images/slimcoverfallback.jpg';

  const textShadow = '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000';

  const chipClass = 'py-1 text-xs font-semibold text-center rounded';
  const bpmChipStyle = (bpm: number) => ({
    backgroundColor: bpmToColor(bpm),
    color: getContrastColor(bpmToColor(bpm)),
    minWidth: '70px',
  });
  const starChipStyle = (star: number) => ({
    backgroundColor: starToColor(star),
    color: getContrastColor(starToColor(star)),
    minWidth: '64px',
  });

  return (
    <div
      style={{ gridRow: `span ${6 + 2 * beatmaps.length + 1}` }}
      className='w-full self-start rounded border border-slate-900'
    >
      {/* beatmapset */}
      <div className='group relative flex h-[96px] w-full flex-col justify-end'>
        <div className='absolute w-full overflow-hidden rounded-t'>
          <div className={cn('relative h-[96px] w-full')}>
            <Image
              src={
                imageError
                  ? slimcoverfallback
                  : ((beatmapset as V1.Beatmapset).covers?.cover ?? (beatmapset as V2.Beatmapset).cover)
              }
              alt={beatmapset.title}
              sizes='(max-width: 340px) 100vw, 340px'
              fill
              className='w-full rounded-t object-cover brightness-[0.4] transition-[filter] group-hover:brightness-100'
              onError={() => setImageError(true)}
            />
          </div>
        </div>
        <div className='relative z-10 pb-3 pl-3 pr-1'>
          <div className='grid' style={{ gridTemplateColumns: '1fr 50px' }}>
            <a href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`} target='_blank'>
              <div style={{ maxWidth: '264px' }}>
                <div className='truncate text-lg font-medium text-white' style={{ textShadow }}>
                  {beatmapset.title}
                </div>
                <div className='truncate text-sm font-medium text-gray-100' style={{ textShadow }}>
                  {beatmapset.artist}
                </div>
                <div className='truncate text-sm font-medium text-gray-100'>
                  <span
                    className='text-slate-200'
                    style={{
                      textShadow: '2px 2px 2px #00000071, 2px 2px 2px #00000071, 2px 2px 2px #00000071',
                    }}
                  >
                    Mapped by
                  </span>{' '}
                  <span style={{ textShadow }}>{beatmapset.creator}</span>
                </div>
              </div>
            </a>
            <BeatmapsetCardPlayButton
              beatmapsetId={beatmapset.id}
              duration={secondsToHHMMSS(Math.max(...beatmaps.map((b) => b.hit_length)))}
            />
          </div>
        </div>
      </div>
      {/* diffs */}
      <div>
        <div className='rounded-b bg-slate-800'>
          {beatmaps.map((beatmap) => (
            <div key={beatmap.id} className='group relative flex items-center gap-1 border-t border-slate-700'>
              <div className='flex gap-1 pl-1'>
                <div className={cn('hidden sm:block', chipClass)} style={bpmChipStyle(beatmap.bpm)}>
                  {Math.floor(beatmap.bpm)} bpm
                </div>
                <div className={cn('mr-2', chipClass)} style={starChipStyle(beatmap.difficulty_rating)}>
                  {beatmap.difficulty_rating.toFixed(2)} ★
                </div>
              </div>
              {beatmap.mode !== 'osu' && (
                <Image
                  src={match(beatmap.mode)
                    .with('taiko', () => '/icons/mode-taiko.png')
                    .with('mania', () => '/icons/mode-mania.png')
                    .with('fruits', () => '/icons/mode-catch.png')
                    .exhaustive()}
                  alt={beatmap.mode}
                  width={20}
                  height={20}
                  className='invert'
                />
              )}

              <b className='truncate py-1'>{beatmap.version}</b>

              <div
                className={cn(
                  'absolute right-0 hidden h-full pl-2 sm:flex',
                  'opacity-0 transition-[opacity] group-hover:opacity-100',
                )}
              >
                <div className='h-full w-8 bg-gradient-to-l from-slate-950 to-transparent' />
                <div className='right-0 flex h-full items-center gap-1 bg-slate-950 pl-2 pr-1'>
                  <a
                    className='ms-auto rounded px-2 py-1 text-sm transition hover:bg-slate-600'
                    href={`osu://b/${beatmap.id}`}
                  >
                    Direct
                  </a>
                  <Popover open={showCopiedToClipboard.includes(beatmap.id)}>
                    <PopoverTrigger>
                      <div
                        className='cursor-pointer rounded p-2 transition hover:bg-slate-600'
                        onClick={() => copyToClipboard(beatmap.id)}
                      >
                        <Clipboard size={12} color='currentColor' />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side='top' align='center' className='w-38 py-2 text-xs'>
                      copied beatmap ID!
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
