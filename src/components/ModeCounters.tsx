import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import { Collection } from '@/shared/entities/v1/Collection';
import { cn } from '@/utils/shadcn-utils';
import Image from 'next/image';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { match } from 'ts-pattern';

export interface ModeCountersProps {
  variant: 'small' | 'full';
  collection: Collection;
}
export default function ModeCounters({ variant, collection }: ModeCountersProps) {
  return match(variant)
    .with('small', () => modeCountersSmall({ collection }))
    .with('full', () => modeCountersFull({ collection }))
    .exhaustive();
}

const modeCountersSmall = ({ collection }: Omit<ModeCountersProps, 'variant'>) => (
  <div className='flex items-center gap-3'>
    {(['osu', 'taiko', 'mania', 'fruits'] as const).map((mode) => (
      <div key={mode} className='flex items-center'>
        <Image
          src={modeIcon(mode)}
          width={18}
          height={18}
          alt={mode}
          className={`mr-1 invert`}
          style={{ opacity: collection.modes?.[mode] > 0 ? 0.9 : 0.2 }}
        />
        <div className={collection.modes?.[mode] > 0 ? undefined : 'text-gray-500'}>
          {collection.modes?.[mode] ?? 0}
        </div>
      </div>
    ))}
  </div>
);

const modeCountersFull = ({ collection }: Omit<ModeCountersProps, 'variant'>) => (
  <div className='flex items-center divide-x divide-gray-600'>
    {(['osu', 'taiko', 'mania', 'fruits'] as const).map((mode, i) => (
      <div
        key={mode}
        className={cn(
          'flex items-center gap-2 px-4',
          i === 0 && 'pl-2',
          !collection.modes?.[mode] && 'pointer-events-none',
        )}
        style={{ opacity: collection.modes?.[mode] > 0 ? 0.9 : 0.6 }}
      >
        <Image
          src={modeIcon(mode)}
          width={32}
          height={32}
          alt={mode}
          className={cn('mr-1 hidden invert sm:block', !collection.modes?.[mode] && 'opacity-20')}
        />
        <div>
          <div className={cn('leading-4', collection.modes?.[mode] ? 'text-gray-300' : 'text-gray-600')}>
            {modeName(mode)}
          </div>
          <div className={cn(collection.modes?.[mode] ? 'font-bold text-white' : 'text-gray-600')}>
            {collection.modes?.[mode] ?? 0}
          </div>
        </div>
      </div>
    ))}
    <UnsubmittedBeatmapsTooltip
      unsubmittedBeatmapCount={collection.unsubmittedBeatmapCount}
      unknownChecksums={collection.unknownChecksums}
    >
      <div className='flex items-center pl-4'>
        <ExclamationTriangleFill className='mr-1' style={{ color: '#ffd966' }} />
        {(collection.unsubmittedBeatmapCount || 0) + (collection.unknownChecksums?.length || 0)}
      </div>
    </UnsubmittedBeatmapsTooltip>
  </div>
);

const modeIcon = (mode: 'osu' | 'taiko' | 'mania' | 'fruits') =>
  match(mode)
    .with('osu', () => '/icons/mode-osu.png')
    .with('taiko', () => '/icons/mode-taiko.png')
    .with('mania', () => '/icons/mode-mania.png')
    .with('fruits', () => '/icons/mode-catch.png')
    .exhaustive();

const modeName = (mode: 'osu' | 'taiko' | 'mania' | 'fruits') =>
  match(mode)
    .with('osu', () => 'Standard')
    .with('taiko', () => 'Taiko')
    .with('mania', () => 'Mania')
    .with('fruits', () => 'Catch')
    .exhaustive();

const UnsubmittedBeatmapsTooltip = ({ children, unsubmittedBeatmapCount, unknownChecksums }) =>
  (unsubmittedBeatmapCount > 0 || unknownChecksums?.length > 0) && (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>
          {unsubmittedBeatmapCount > 0 && <div>{unsubmittedBeatmapCount} unsubmitted</div>}
          {unknownChecksums.length > 0 && <div>{unknownChecksums.length} processing</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
