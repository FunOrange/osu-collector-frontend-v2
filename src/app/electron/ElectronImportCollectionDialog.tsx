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
import { useCollection, useUser } from '@/services/osu-collector-api-hooks';
import { Skeleton } from '@/components/shadcn/skeleton';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import { Checkbox } from '@/components/shadcn/checkbox';
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
import { BeatmapFilters, filterBeatmaps } from '@/utils/beatmap-filter-utils';
import { useOsuCollectionsFile } from '@/app/electron/useOsuCollectionsFile';

const defaultFilters: BeatmapFilters = { stars: [0, 11], bpm: [150, 310] };

interface CollectionImportOptions {
  modifyCollectionDb: boolean;
  queueDownloads: boolean;
}

export function ElectronImportCollectionDialog() {
  const { toast } = useToast();
  const { user } = useUser();
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

  const { data: v3 } = useSWR(collectionId ? `/collections/${collectionId}/beatmapsv3` : null, (url) =>
    api.get<{ beatmaps: Beatmap[]; beatmapsets: Beatmapset[] }>(url).then((res) => res.data),
  );

  const filteredBeatmapsetIds = (() => {
    if (equals(filters, defaultFilters)) {
      return collection?.beatmapsets?.map((b) => b.id) ?? [];
    } else {
      if (!v3) return collection?.beatmapsets?.map((b) => b.id) ?? [];

      const beatmapsWithBeatmapsets = joinBeatmapsets(v3.beatmaps, v3.beatmapsets);
      const results = filterBeatmaps(beatmapsWithBeatmapsets, filters);
      return uniq(results?.map((beatmap) => beatmap.beatmapset_id) ?? []);
    }
  })();

  const collectionsFile = useOsuCollectionsFile(preferences?.osuInstallDirectory, pathSep);
  const mergeDisabledReason = (() => {
    if (!preferences?.osuInstallDirectory) return 'Please set your osu! install folder in settings!';
    if (!collectionsFile.exists)
      return `File not found: ${collectionsFile.path}\nPlease fix your osu! install folder in settings!`;
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
    <div className='flex flex-col items-center gap-1'>
      <File className='h-8 w-8' />
      <div className='text-xs text-white'>.osz</div>
    </div>
  );

  const fadeOutStyle = (condition: boolean) =>
    cn('transition-[transform,opacity]', condition && 'translate-y-[2px] opacity-40');

  const [modifyingCollectionDb, setModifyingCollectionDb] = useState(false);
  const [submit, submitting] = useSubmit(async () => {
    localStorage.setItem('collection-import-options', JSON.stringify(options));
    if (!user) {
      toast({ title: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    // for osu!lazer, the app decides whether collections can be added while the game is running
    const isOsuRunning = !collectionsFile.isLazer && (await window.ipc.checkIfOsuIsRunning());
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
      toast(
        collectionsFile.isLazer
          ? {
              title: 'Collection added to osu!lazer!',
              description: 'If osu!lazer is open, it should appear right away',
            }
          : { title: 'collection.db successfully modified!', description: 'Please restart osu!' },
      );
    }

    if (!skipping.queueDownloads) {
      const payload = {
        beatmapsetIds: filteredBeatmapsetIds,
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
        description: filteredBeatmapsetIds.length + ' maps have been queued for download',
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
          <DialogDescription className='flex max-h-[calc(100vh-200px)] flex-col gap-4 overflow-y-auto'>
            <label
              htmlFor='modify-collection-db-checkbox'
              className={cn(
                'flex w-full flex-col items-start gap-1 self-start rounded p-2',
                'cursor-pointer transition-colors hover:bg-slate-700/50',
              )}
            >
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='modify-collection-db-checkbox'
                  checked={options.modifyCollectionDb}
                  onCheckedChange={(checked) => setOptions(assoc('modifyCollectionDb', checked))}
                />
                <span className={cn('text-sm', !skipping.modifyCollectionDb && 'text-white')}>
                  modify {collectionsFile.filename} file{' '}
                  {skipping.modifyCollectionDb && (
                    <span className={cn(options.modifyCollectionDb && 'text-red-400')}>(skipping)</span>
                  )}
                </span>
              </div>
              <div>
                <div className='text-xs'>
                  {collectionsFile.isLazer
                    ? 'This will add the collection to osu!lazer.'
                    : 'This will allow the collection to appear in osu! stable. PLEASE restart your game after!!!'}
                </div>
                <div className='whitespace-pre-line text-xs text-red-400'>
                  {options.modifyCollectionDb && mergeDisabledReason}
                </div>
              </div>
              <WindowsFileExplorer
                addressBar={preferences?.osuInstallDirectory}
                className={cn('mt-2', fadeOutStyle(Boolean(skipping.modifyCollectionDb)))}
              >
                <div className='flex flex-col items-center gap-1 text-white'>
                  <File className='h-8 w-8' />
                  <div className='text-xs'>{collectionsFile.filename}</div>
                  <div className='text-xs text-green-400'>+{formatBytes(32 * (collection?.beatmapCount ?? 0), 1)}</div>
                </div>
              </WindowsFileExplorer>
            </label>

            <label
              htmlFor='queue-downloads-checkbox'
              className={cn(
                'flex w-full flex-col items-start gap-1 self-start rounded p-2',
                'cursor-pointer transition-colors hover:bg-slate-700/50',
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
                  Estimated size of all items: {formatBytes(filteredBeatmapsetIds.length * 10 * ONE_MEGABYTE)}
                </div>
                <div className='text-xs'>osu!Collector will skip the maps you already have</div>
                {collectionsFile.isLazer && (
                  <div className='text-xs'>Downloaded maps will be imported into osu!lazer automatically</div>
                )}
                <div className='whitespace-pre-line text-xs text-red-400'>
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
                    <ThreeDots className='ml-1 text-xl text-gray-400' color='currentColor' />
                  </div>
                </div>
              </WindowsFileExplorer>
            </label>

            {options.queueDownloads && !skipping.queueDownloads && (
              <div className='flex w-full flex-col gap-1 self-start rounded p-2'>
                Maps matching these filters will be downloaded:
                {equals(filters, defaultFilters) ? (
                  <div className='text-xs text-green-500'>all maps will be downloaded</div>
                ) : (
                  <div className='cursor-pointer text-xs text-blue-500 hover:underline' onClick={resetFilters}>
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
              disabled={!collection || !collectionId || (skipping.modifyCollectionDb && skipping.queueDownloads)}
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
          <DialogTitle>Modifying {collectionsFile.filename}...</DialogTitle>

          <DialogDescription className='flex max-h-[calc(100vh-200px)] flex-col items-center gap-2 overflow-y-auto'>
            <RefreshCw className='h-8 w-8 animate-spin' />
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
    <div className={cn('rounded border border-black/50 bg-[#1F1F1F]', className)}>
      <div className='flex items-center gap-2 px-2 py-2 text-white'>
        <ArrowLeft className='text-md h-3 w-3' color='currentColor' />
        <ArrowRight className='text-md h-3 w-3 text-gray-400' color='currentColor' />
        <ArrowUp className='text-md h-3 w-3' color='currentColor' />
        <div className='bg-slate line-clamp-1 flex items-center justify-between gap-4 rounded bg-[#2D2C2C] px-2 py-1 text-xs'>
          {addressBar}
          <ArrowClockwise className='text-md text-gray-400' color='currentColor' />
        </div>
      </div>
      <div className='flex flex-col items-start bg-[#191919] p-4'>{children}</div>
    </div>
  );
}

const className = {
  graphTitle: cn('font-semibold text-white text-lg'),
  graph: cn('transition-all px-6 pb-2 h-[130px] rounded-lg', 'lg:h-[120px]'),
};
