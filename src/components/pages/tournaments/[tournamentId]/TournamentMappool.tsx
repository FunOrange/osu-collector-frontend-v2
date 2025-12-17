'use client';
import BeatmapsetCardPlayButton from '@/components/pages/collections/[collectionId]/BeatmapsetCardPlayButton';
import ImageWithFallback from '@/components/universal/ImageWithFallback';
import { Tournament, TournamentBeatmap } from '@/shared/entities/v1/Tournament';
import { calculateARWithHR, calculateODWithHR, calculateARWithDT, calculateODWithDT } from '@/utils/diff-calc';
import { cn } from '@/utils/shadcn-utils';
import React, { useState } from 'react';
import { Provider } from 'jotai';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import { Clipboard } from 'react-bootstrap-icons';
import { secondsToHHMMSS } from '@/utils/date-time-utils';
import { getContrastColor, modToColor, starToColor } from '@/utils/theme-utils';
import TabSwitcher from '@/components/universal/TabSwitcher';

export interface TournamentMappoolProps {
  tournament: Tournament;
}
export default function TournamentMappool({ tournament }: TournamentMappoolProps) {
  const [_currentRound, setCurrentRound] = useState<string | undefined>();
  const currentRound = _currentRound ?? tournament.rounds[0]?.round;
  const round = tournament.rounds.find((round) => round.round === currentRound);

  return (
    <Provider>
      <div className='flex flex-wrap rounded-t bg-slate-700'>
        <TabSwitcher
          items={tournament.rounds.map((round) => ({ label: round.round, value: round.round }))}
          value={currentRound}
          onChange={setCurrentRound}
        />
      </div>
      <div className='flex flex-col gap-10 p-4 md:gap-2'>
        {round?.mods.map((mod, j) => (
          <React.Fragment key={j}>
            {mod.maps.map((beatmap, k) => {
              let moddedBeatmap: TournamentBeatmap | undefined;
              if (typeof beatmap === 'object') {
                moddedBeatmap = { ...beatmap };
                if (mod.mod.toLowerCase() === 'hr') {
                  moddedBeatmap.cs = Math.round((beatmap.cs + 1.2) * 10) / 10;
                  moddedBeatmap.ar = Math.round(10 * calculateARWithHR(beatmap.ar)) / 10;
                  moddedBeatmap.accuracy = Math.round(10 * calculateODWithHR(beatmap.accuracy)) / 10;
                }
                if (mod.mod.toLowerCase() === 'dt') {
                  moddedBeatmap.ar = Math.round(10 * calculateARWithDT(beatmap.ar)) / 10;
                  moddedBeatmap.accuracy = Math.round(10 * calculateODWithDT(beatmap.accuracy)) / 10;
                  moddedBeatmap.bpm = Math.round(beatmap.bpm * 1.5);
                }
              }
              return <MappoolBeatmap key={k} mod={mod.mod} modIndex={k + 1} beatmap={moddedBeatmap || beatmap} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </Provider>
  );
}

interface MappoolBeatmapProps {
  mod: string;
  modIndex: number;
  beatmap: TournamentBeatmap;
}
function MappoolBeatmap({ mod, modIndex, beatmap }: MappoolBeatmapProps) {
  const [imageHovered, setImageHovered] = useState(false);
  const [showCopiedToClipboard, setShowCopiedToClipboard] = useState<number[]>([]);

  const beatmapset = beatmap.beatmapset;
  const dt = mod.toLowerCase() === 'dt';
  const hr = mod.toLowerCase() === 'hr';
  const ez = mod.toLowerCase() === 'ez';
  const ht = mod.toLowerCase() === 'ht';
  const diffUp = <span className='mr-1 text-red-400'>▲</span>;
  const diffDown = <span className='text-emerald-400'>▼</span>;
  const duration = secondsToHHMMSS(beatmap.hit_length / (dt ? 1.5 : 1));
  const beatmapBeingProcessed = typeof beatmap === 'number';
  const beatmapId = beatmapBeingProcessed ? beatmap : beatmap.id;
  const stars = Math.round(beatmap.difficulty_rating * 10) / 10;

  if (!beatmap.beatmapset?.id) {
    const url = `https://osu.ppy.sh/beatmaps/${beatmap.id}`;
    return (
      <div className='flex items-center gap-3 rounded bg-slate-950/50 p-4'>
        <div
          className='rounded p-3 text-lg font-semibold'
          style={{
            background: modToColor(mod),
            color: getContrastColor(modToColor(mod)),
          }}
        >
          {mod}
          {modIndex}
        </div>
        <div className='text-slate-400'>
          <div className='line-clamp-1'>We are currently looking up this beatmap... </div>
          <a href={url} className='line-clamp-1 text-sm text-slate-300 underline'>
            {url}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-2 md:flex-row'>
      <div className='h-[84px] w-full shrink-0 md:w-[340px]'>
        {/* song background */}
        <div className='relative rounded'>
          {beatmap.beatmapset?.covers?.card && (
            <div className='absolute h-full w-full overflow-hidden rounded'>
              <div className={cn('relative h-full w-full', imageHovered ? undefined : 'blur-sm')}>
                <ImageWithFallback
                  src={beatmap.beatmapset?.covers?.card}
                  fallbackSrc={'/images/slimcoverfallback.jpg'}
                  alt={beatmap.beatmapset?.title}
                  fill
                  sizes='340px'
                  className='rounded object-cover'
                  style={{
                    transition: 'filter 0.1s',
                    filter: `brightness(${imageHovered ? 1 : 0.5})`,
                  }}
                />
              </div>
            </div>
          )}
          {!beatmap.beatmapset?.covers?.card && (
            <div className='rounded bg-slate-900' style={{ width: 340, height: 84 }} />
          )}
          {beatmapset && (
            <div
              className='relative z-10 py-2 pl-3 pr-1'
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
            >
              <div className='grid gap-2' style={{ gridTemplateColumns: '1fr 50px' }}>
                <a
                  href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}#${beatmap.mode}/${beatmap.id}`}
                  target='_blank'
                >
                  <div style={{ maxWidth: '264px' }}>
                    <div
                      className='line-clamp-1 text-lg font-medium text-white'
                      style={{
                        textShadow: '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000',
                      }}
                    >
                      {beatmapset.title}
                    </div>
                    <div
                      className='line-clamp-1 text-sm font-medium text-gray-100'
                      style={{
                        textShadow: '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000',
                      }}
                    >
                      {beatmapset.artist}
                    </div>
                    <div className='line-clamp-1 text-sm font-medium text-gray-100'>
                      <span
                        className='text-slate-200 opacity-70'
                        style={{
                          textShadow: '2px 2px 2px #00000071, 2px 2px 2px #00000071, 2px 2px 2px #00000071',
                        }}
                      >
                        Mapped by
                      </span>{' '}
                      <span
                        style={{
                          textShadow: '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000',
                        }}
                      >
                        {beatmapset.creator}
                      </span>
                    </div>
                  </div>
                </a>
                <BeatmapsetCardPlayButton beatmapsetId={beatmapset.id} duration={duration} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='group relative flex flex-grow items-center gap-2'>
        <div
          className='flex w-20 items-center justify-center self-stretch rounded p-4 text-xl font-semibold'
          style={{
            background: modToColor(mod),
            color: getContrastColor(modToColor(mod)),
          }}
        >
          {mod}
          {modIndex}
        </div>
        {!beatmapBeingProcessed && (
          <div className='w-full'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='text-xl'>{`[${beatmap?.version}]`}</div>
              <div
                className='rounded-sm px-2 text-sm font-bold'
                style={{
                  background: starToColor(stars),
                  color: getContrastColor(starToColor(stars)),
                }}
              >
                {stars} ★
              </div>
            </div>
            <div className='flex flex-wrap gap-2 text-sm'>
              <div className={cn('rounded-sm bg-slate-700 px-2')}>{Math.round(beatmap.bpm)} bpm</div>
              <div className={cn('rounded-sm bg-slate-700 px-2')}>
                {hr && diffUp}
                CS {beatmap.cs}
              </div>
              <div className={cn('rounded-sm bg-slate-700 px-2')}>
                {(dt || hr) && diffUp}
                AR {beatmap.ar}
              </div>
              <div className={cn('rounded-sm bg-slate-700 px-2')}>
                {(dt || hr) && diffUp}
                OD {beatmap.accuracy}
              </div>
            </div>
          </div>
        )}
        {beatmapBeingProcessed && (
          <div className='text-slate-500'>
            Beatmap not in database.{' '}
            <a href={`https://osu.ppy.sh/b/${beatmap}`} target='_blank' className='text-blue-300 underline'>
              Go to beatmap page
            </a>
          </div>
        )}

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
              href={`osu://b/${beatmapId}`}
            >
              Direct
            </a>
            <Popover open={showCopiedToClipboard.includes(beatmapId)}>
              <PopoverTrigger>
                <div
                  className='cursor-pointer rounded p-2 transition hover:bg-slate-600'
                  onClick={() => {
                    navigator.clipboard.writeText(beatmapId.toString());
                    setShowCopiedToClipboard((prev) => [...prev, beatmapId]);
                    setTimeout(() => setShowCopiedToClipboard((prev) => prev.filter((id) => id !== beatmapId)), 2000);
                  }}
                >
                  <Clipboard size={12} />
                </div>
              </PopoverTrigger>
              <PopoverContent side='top' align='center' className='w-38 py-2 text-xs'>
                copied beatmap ID!
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return <div className='rounded-sm bg-pink-400'>{children}</div>;
}
