'use client';
import { useState } from 'react';
import { Clipboard } from 'react-bootstrap-icons';
import Image from 'next/image';
import { match } from 'ts-pattern';
import { secondsToHHMMSS } from '@/utils/date-time-utils';
import { bpmToColor, getContrastColor, starToColor } from '@/utils/theme-utils';
import { Beatmap } from '@/shared/entities/v1/Beatmap';
import { Beatmapset } from '@/shared/entities/v1/Beatmapset';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import BeatmapsetCardPlayButton from '@/components/pages/collections/[collectionId]/BeatmapsetCardPlayButton';
import { cn } from '@/utils/shadcn-utils';

export interface BeatmapsetCardCardProps {
  beatmapset: Beatmapset;
  beatmaps: Beatmap[];
}
export default function BeatmapsetCard({ beatmapset, beatmaps }: BeatmapsetCardCardProps) {
  const [showCopiedToClipboard, setShowCopiedToClipboard] = useState<number[]>([]);

  const [imageError, setImageError] = useState(false);
  const slimcoverfallback = '/images/slimcoverfallback.jpg';
  const [imageHovered, setImageHovered] = useState(false);

  const textShadow = '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000';

  return (
    <div>
      <div className='sm:grid gap-2' style={{ gridTemplateColumns: '340px 1fr' }}>
        {/* beatmapset */}
        <div className='relative rounded'>
          <div className='absolute w-full overflow-hidden rounded-t sm:rounded-b'>
            <div className={cn('relative h-[84px] w-full', imageHovered ? undefined : 'blur-sm')}>
              <Image
                src={imageError ? slimcoverfallback : beatmapset.covers.cover}
                alt={beatmapset.title}
                sizes='(max-width: 340px) 100vw, 340px'
                fill
                className='w-full rounded'
                style={{
                  transition: 'filter 0.1s',
                  objectFit: 'cover',
                  filter: `brightness(${imageHovered ? 1 : 0.5})`,
                }}
                onError={() => setImageError(true)}
              />
            </div>
          </div>
          <div
            className='relative z-10 py-2 pl-3 pr-1'
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={() => setImageHovered(false)}
          >
            <div className='grid gap-2' style={{ gridTemplateColumns: '1fr 50px' }}>
              <a href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`} target='_blank'>
                <div style={{ maxWidth: '264px' }}>
                  <div className='text-lg font-medium text-white truncate' style={{ textShadow }}>
                    {beatmapset.title}
                  </div>
                  <div className='text-sm font-medium text-gray-100 truncate' style={{ textShadow }}>
                    {beatmapset.artist}
                  </div>
                  <div className='text-sm font-medium text-gray-100 truncate'>
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
              <BeatmapsetCardPlayButton beatmapsetId={beatmapset.id} />
            </div>
          </div>
        </div>
        {/* diffs */}
        <div>
          <div className='rounded-b sm:rounded-t bg-slate-800'>
            {beatmaps.map((beatmap) => (
              <div
                key={beatmap.id}
                className='grid items-center gap-2 p-1'
                style={{ gridTemplateColumns: 'auto 1fr auto' }}
              >
                <div className='flex gap-1'>
                  <div
                    className='py-1 text-xs font-semibold text-center bg-gray-600 rounded'
                    style={{ minWidth: '50px' }}
                  >
                    {secondsToHHMMSS(beatmap.hit_length)}
                  </div>
                  <div
                    className='py-1 text-xs font-semibold text-center rounded text-sky-900'
                    style={{
                      backgroundColor: bpmToColor(beatmap.bpm),
                      color: getContrastColor(bpmToColor(beatmap.bpm)),
                      minWidth: '70px',
                    }}
                  >
                    {Math.floor(beatmap.bpm)} bpm
                  </div>
                  <div
                    className='py-1 text-xs font-semibold text-center rounded'
                    style={{
                      backgroundColor: starToColor(beatmap.difficulty_rating),
                      color: getContrastColor(starToColor(beatmap.difficulty_rating)),
                      minWidth: '64px',
                    }}
                  >
                    {beatmap.difficulty_rating.toFixed(2)} ★
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
                      style={{
                        imageRendering: 'auto',
                        width: '18px',
                        height: 'auto',
                      }}
                      className='mr-2'
                    />
                  )}
                </div>

                <b className='mr-2 truncate'>{beatmap.version}</b>

                <div className='flex items-center gap-1 ms-auto'>
                  <a
                    className='px-2 py-1 text-sm transition rounded ms-auto hover:bg-slate-600'
                    href={`osu://b/${beatmap.id}`}
                  >
                    Direct
                  </a>
                  <Popover open={showCopiedToClipboard.includes(beatmap.id)}>
                    <PopoverTrigger>
                      <div
                        className='p-2 transition rounded cursor-pointer hover:bg-slate-600'
                        onClick={() => {
                          navigator.clipboard.writeText(beatmap.id.toString());
                          setShowCopiedToClipboard((prev) => [...prev, beatmap.id]);
                          setTimeout(
                            () => setShowCopiedToClipboard((prev) => prev.filter((id) => id !== beatmap.id)),
                            2000,
                          );
                        }}
                      >
                        <Clipboard size={12} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side='top' align='center' className='py-2 text-xs w-38'>
                      copied beatmap ID!
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
