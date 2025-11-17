'use client';
import { Channel } from '@/app/electron/ipc-types';
import { ReactNode, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/shadcn/dialog';
import { useCollection } from '@/services/osu-collector-api-hooks';
import { Skeleton } from '@/components/shadcn/skeleton';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import { Checkbox } from '@/components/shadcn/checkbox';
import useClientValue from '@/hooks/useClientValue';
import { assoc, clone, equals, uniq } from 'ramda';
import { ArrowClockwise, ArrowLeft, ArrowRight, ArrowUp, ThreeDots } from 'react-bootstrap-icons';
import { File, RefreshCw } from 'lucide-react';
import { formatBytes } from '@/utils/string-utils';
import useSubmit, { DisplayableError } from '@/hooks/useSubmit';
import { JSONParse } from '@/utils/object-utils';
import { tryCatch } from '@/utils/try-catch';
import { useToast } from '@/components/shadcn/use-toast';
import { ONE_MEGABYTE } from '@/utils/number-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';
import BarGraphStars from '@/components/pages/collections/[collectionId]/BarGraphStars';
import { Slider } from '@/components/shadcn/slider';
import BarGraphBpm from '@/components/pages/collections/[collectionId]/BarGraphBpm';
import { api } from '@/services/osu-collector-api';
import { Beatmap, BeatmapWithBeatmapset } from '@/shared/entities/v2/Beatmap';
import { Beatmapset } from '@/shared/entities/v2/Beatmapset';
import { joinBeatmapsets } from '@/components/pages/collections/[collectionId]/CollectionBeatmapsSection';
import { match } from 'ts-pattern';

interface CollectionImportOptions {
  modifyCollectionDb: boolean;
  queueDownloads: boolean;
}

interface BeatmapFilters {
  stars: [number, number];
  bpm: [number, number];
  status?: 'any' | 'ranked' | 'qualified' | 'loved' | 'pending' | 'graveyard' | null;
}

const defaultFilters: BeatmapFilters = { stars: [0, 11], bpm: [150, 310] };

export function ElectronImportCollectionDialog() {
  const { toast } = useToast();
  const { data: uri, mutate: mutateURI } = useSWR(window.ipc && Channel.GetURI, window.ipc?.getURI);
  const [collectionId, setCollectionId] = useState<number | undefined>();
  const [filters, setFilters] = useState<BeatmapFilters>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<BeatmapFilters>(defaultFilters);
  const resetFilters = () => {
    setPendingFilters(defaultFilters);
    setFilters(defaultFilters);
  };
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    const collectionId = Number(uri?.match(/osucollector:\/\/collections\/(\d+)/)?.[1]);
    if (collectionId) {
      setOpen(true);
      setCollectionId(collectionId);
      mutateURI(window.ipc.clearURI().then(() => undefined));
      const search = new URLSearchParams(uri?.match(/osucollector:\/\/collections\/\d+(.+)$/)?.[1]);
      if (search.size > 0) {
        const filters = {
          stars: (search.get('stars')?.split(',').map(Number) as [number, number]) || defaultFilters.stars,
          bpm: (search.get('bpm')?.split(',').map(Number) as [number, number]) || defaultFilters.bpm,
          status: search.get('status') as BeatmapFilters['status'],
        };
        setPendingFilters(filters);
        setFilters(filters);
      }
    }
  }, [uri, setCollectionId, mutateURI]);

  useEffect(() => {
    window.ipc?.onURI(() => mutateURI());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { collection, isLoading } = useCollection(collectionId);
  const { data: preferences } = useSWR(Channel.GetPreferences, () => window.ipc?.getPreferences());
  const { data: downloadDirectory } = useSWR(Channel.GetDownloadDirectory, () => window.ipc?.getDownloadDirectory());
  const { data: downloadDirectoryExists } = useSWR([Channel.PathExists, downloadDirectory], ([_, path]) =>
    window.ipc?.pathExists(path!),
  );
  const [pathSep, setPathSep] = useState<string>('\\');
  useEffect(() => {
    window.ipc?.pathSep().then(setPathSep);
  }, []);

  const collectionDbPath = preferences?.osuInstallDirectory! + pathSep + 'collection.db';
  const { data: collectionDbExists } = useSWR([Channel.PathExists, collectionDbPath], ([_, path]) =>
    window.ipc?.pathExists(path!),
  );
  const mergeDisabledReason = (() => {
    if (!preferences?.osuInstallDirectory) return 'Please set your osu! install folder in settings!';
    if (!collectionDbExists)
      return `File not found: ${collectionDbPath}\nPlease fix your osu! install folder in settings!`;
    return false;
  })();

  const downloadsDisabledReason = (() => {
    if (!downloadDirectory) return 'Please set your download directory in settings!';
    if (!downloadDirectoryExists)
      return `This folder does not exist: ${downloadDirectory} - please fix this in settings!`;
    return false;
  })();

  const [options, setOptions] = useState(
    (() => {
      const [options, err] = JSONParse<CollectionImportOptions>(
        localStorage.getItem('collection-import-options') ?? undefined,
      );
      return options ?? { modifyCollectionDb: true, queueDownloads: true };
    })(),
  );
  const skipping = {
    modifyCollectionDb: !options.modifyCollectionDb || Boolean(mergeDisabledReason),
    queueDownloads: !options.queueDownloads || Boolean(downloadsDisabledReason),
  };

  const oszFile = (
    <div className='flex flex-col gap-1 items-center'>
      <File className='w-8 h-8' />
      <div className='text-white text-xs'>.osz</div>
    </div>
  );

  const fadeOutStyle = (condition: boolean) =>
    cn('transition-[transform,opacity]', condition && 'translate-y-[2px] opacity-40');

  const [modifyingCollectionDb, setModifyingCollectionDb] = useState(false);
  const [submit, submitting] = useSubmit(async () => {
    localStorage.setItem('collection-import-options', JSON.stringify(options));

    const isOsuRunning = await window.ipc.checkIfOsuIsRunning();
    if (isOsuRunning) {
      throw new DisplayableError('osu! is currently running! Please close it and try again.');
    }

    if (!skipping.modifyCollectionDb) {
      setModifyingCollectionDb(true);
      const [_, collectionDbError] = await tryCatch(window.ipc.mergeCollectionDb({ collectionId: collectionId! }));
      setModifyingCollectionDb(false);
      if (collectionDbError) {
        throw new DisplayableError(collectionDbError.message);
      }
      toast({
        title: 'collection.db successfully modified!',
        description: 'You should now see this collection in osu!',
      });
    }

    if (!skipping.queueDownloads) {
      const beatmapsetIds = await (async () => {
        if (equals(filters, defaultFilters)) {
          return collection?.beatmapsets.map((b) => b.id);
        } else {
          const v3 = await api
            .get<{ beatmaps: Beatmap[]; beatmapsets: Beatmapset[] }>(`/collections/${collectionId}/beatmapsv3`)
            .then((res) => res.data);

          // apply filters
          const _filters = clone(filters);
          if (filters.stars[0] === 0) _filters.stars[0] = -Infinity;
          if (filters.stars[1] === 11) _filters.stars[1] = Infinity;
          if (filters.bpm[0] === 150) _filters.bpm[0] = -Infinity;
          if (filters.bpm[1] === 310) _filters.bpm[1] = Infinity;

          const byRankedStatus = (beatmap: BeatmapWithBeatmapset) =>
            match(filters.status)
              .with('any', () => true)
              .with('ranked', () => beatmap.status === 'ranked')
              .with('qualified', () => beatmap.status === 'qualified')
              .with('loved', () => beatmap.status === 'loved')
              .with('pending', () => beatmap.status === 'pending')
              .with('graveyard', () => beatmap.status === 'graveyard')
              .with(undefined, () => true)
              .with(null, () => true)
              .exhaustive();
          const isWithinRange = ([min, max]: [number, number], value: number) => value >= min && value < max;
          const withinStarRange = (beatmap: BeatmapWithBeatmapset) =>
            isWithinRange(_filters.stars, beatmap.difficulty_rating);
          const withinBpmRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.bpm, beatmap.bpm);
          const beatmapsWithBeatmapsets = joinBeatmapsets(v3.beatmaps, v3.beatmapsets);
          const results = beatmapsWithBeatmapsets
            ?.filter(byRankedStatus)
            .filter(withinStarRange)
            .filter(withinBpmRange);
          return uniq(results?.map((beatmap) => beatmap.beatmapset_id) ?? []);
        }
      })();
      const payload = {
        beatmapsetIds: beatmapsetIds,
        metadata: {
          collection: {
            id: collectionId!,
            name: collection!.name,
            uploader: {
              id: collection!.uploader.id,
              username: collection!.uploader.username,
            },
          },
        },
      };
      const [__, downloadsError] = await tryCatch(window.ipc.addDownloads(payload));
      mutate(swrKeyIncludes(Channel.GetDownloads));
      if (downloadsError) {
        throw new DisplayableError(downloadsError.message);
      }
      toast({
        title: 'Downloads started!',
        description: collection!.beatmapsets.length + ' maps have been queued for download',
      });
    }
    setOpen(false);
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <Skeleton loading={isLoading} className='min-h-[38px]'>
            <DialogTitle className='mb-1'>{collection?.name}</DialogTitle>
            <div className='text-xs text-slate-400'>
              {collection?.beatmapCount} beatmaps, uploaded by {collection?.uploader.username}
            </div>
          </Skeleton>
          <DialogDescription className='flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto'>
            <label
              htmlFor='modify-collection-db-checkbox'
              className={cn(
                'w-full flex flex-col items-start gap-1 self-start p-2 rounded',
                'transition-colors cursor-pointer hover:bg-slate-700/50',
              )}
            >
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='modify-collection-db-checkbox'
                  checked={options.modifyCollectionDb}
                  onCheckedChange={(checked) => setOptions(assoc('modifyCollectionDb', checked))}
                />
                <span className={cn('text-sm', !skipping.modifyCollectionDb && 'text-white')}>
                  modify collection.db file{' '}
                  {skipping.modifyCollectionDb && (
                    <span className={cn(options.modifyCollectionDb && 'text-red-400')}>(skipping)</span>
                  )}
                </span>
              </div>
              <div>
                <div className='text-xs'>This will allow the collection to appear in osu! stable</div>
                <div className='text-xs text-red-400 whitespace-pre-line'>
                  {options.modifyCollectionDb && mergeDisabledReason}
                </div>
              </div>
              <WindowsFileExplorer
                addressBar={preferences?.osuInstallDirectory}
                className={cn('mt-2', fadeOutStyle(Boolean(skipping.modifyCollectionDb)))}
              >
                <div className='flex flex-col gap-1 items-center text-white'>
                  <File className='w-8 h-8' />
                  <div className='text-xs'>collection.db</div>
                  <div className='text-xs text-green-400'>+{formatBytes(32 * (collection?.beatmapCount ?? 0), 1)}</div>
                </div>
              </WindowsFileExplorer>
            </label>

            <label
              htmlFor='queue-downloads-checkbox'
              className={cn(
                'w-full flex flex-col items-start gap-1 self-start p-2 rounded',
                'transition-colors cursor-pointer hover:bg-slate-700/50',
              )}
            >
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='queue-downloads-checkbox'
                  checked={options.queueDownloads}
                  onCheckedChange={(checked) => setOptions(assoc('queueDownloads', checked))}
                />
                <span className={cn('text-sm', !skipping.queueDownloads && 'text-white')}>
                  download maps{' '}
                  {skipping.queueDownloads && (
                    <span className={cn(options.queueDownloads && 'text-red-400')}>(skipping)</span>
                  )}
                </span>
              </div>
              <div>
                <div className='text-xs'>
                  Estimated size of all items: {formatBytes(collection?.beatmapsets?.length * 10 * ONE_MEGABYTE)}
                </div>
                <div className='text-xs'>osu!Collector will skip the maps you already have</div>
                <div className='text-xs text-red-400 whitespace-pre-line'>
                  {options.queueDownloads && downloadsDisabledReason}
                </div>
              </div>
              <WindowsFileExplorer
                addressBar={downloadDirectory}
                className={cn('mt-2', fadeOutStyle(Boolean(skipping.queueDownloads)))}
              >
                <div className='text-white'>
                  <div className='flex items-center gap-3'>
                    {oszFile}
                    {oszFile}
                    {oszFile}
                    {oszFile}
                    <ThreeDots className='ml-1 text-xl text-gray-400' />
                  </div>
                </div>
              </WindowsFileExplorer>
            </label>

            {options.queueDownloads && !skipping.queueDownloads && (
              <div className='w-full flex flex-col gap-1 self-start p-2 rounded'>
                Maps matching these filters will be downloaded:
                {equals(filters, defaultFilters) ? (
                  <div className='text-green-500 text-xs'>all maps will be downloaded</div>
                ) : (
                  <div className='cursor-pointer hover:underline text-blue-500 text-xs' onClick={resetFilters}>
                    click here to download all maps
                  </div>
                )}
                <div className={className.graphTitle}>Filter by Star Rating</div>
                <BarGraphStars
                  title=''
                  collection={collection}
                  className={className.graph}
                  barClassName='rounded-t-lg'
                  filter={pendingFilters.stars}
                  onBarClick={(star) => {
                    setPendingFilters(assoc('stars', [star, star + 1]));
                    setFilters(assoc('stars', [star, star + 1]));
                  }}
                />
                <div className='px-5 pb-4'>
                  <Slider
                    variant='orange'
                    min={1}
                    max={11}
                    step={0.5}
                    value={pendingFilters.stars}
                    onValueChange={(v) => setPendingFilters(assoc('stars', v))}
                    onValueCommit={(v) => setFilters(assoc('stars', v))}
                  />
                </div>
                <div className={className.graphTitle}>Filter by BPM</div>
                <BarGraphBpm
                  title=''
                  collection={collection}
                  className={className.graph}
                  barClassName='rounded-t-md'
                  filter={pendingFilters.bpm}
                  onBarClick={(bpm) => {
                    setPendingFilters(assoc('bpm', [bpm, bpm + 10]));
                    setFilters(assoc('bpm', [bpm, bpm + 10]));
                  }}
                />
                <div className='px-5 pb-4'>
                  <Slider
                    variant='sky'
                    min={150}
                    max={310}
                    step={10}
                    value={pendingFilters.bpm}
                    onValueChange={(v) => setPendingFilters(assoc('bpm', v))}
                    onValueCommit={(v) => setFilters(assoc('bpm', v))}
                  />
                </div>
              </div>
            )}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant='important'
              disabled={!collectionId || (skipping.modifyCollectionDb && skipping.queueDownloads)}
              loading={submitting}
              onClick={submit}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modifyingCollectionDb}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogTitle>Modifying collection.db...</DialogTitle>

          <DialogDescription className='flex flex-col items-center gap-2 max-h-[calc(100vh-200px)] overflow-y-auto'>
            <RefreshCw className='w-8 h-8 animate-spin' />
            Please wait...
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface WindowsFileExplorerProps {
  addressBar: string | undefined;
  children: ReactNode;
  className?: string;
}
function WindowsFileExplorer({ addressBar, children, className }: WindowsFileExplorerProps) {
  return (
    <div className={cn('border border-black/50 bg-[#1F1F1F] rounded', className)}>
      <div className='flex items-center gap-2 text-white px-2 py-2'>
        <ArrowLeft className='text-md' />
        <ArrowRight className='text-md text-gray-400' />
        <ArrowUp className='text-md' />
        <div className='flex justify-between gap-4 items-center bg-slate px-2 py-1 bg-[#2D2C2C] text-xs rounded line-clamp-1'>
          {addressBar}
          <ArrowClockwise className='text-md text-gray-400' />
        </div>
      </div>
      <div className='p-4 flex flex-col items-start bg-[#191919]'>{children}</div>
    </div>
  );
}

const className = {
  graphTitle: cn('font-semibold text-white text-lg'),
  graph: cn('transition-all px-6 pb-2 h-[130px] rounded-lg', 'lg:h-[120px]'),
};
