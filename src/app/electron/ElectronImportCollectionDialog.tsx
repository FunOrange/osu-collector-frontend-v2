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
import { ImportTargetSwitch, useImportTarget } from '@/app/electron/useImportTarget';
import {
  collectionsAddedToast,
  CollectionsStepDetails,
  downloadsStartedToast,
  DownloadsStepDetails,
} from '@/app/electron/ImportSteps';

const defaultFilters: BeatmapFilters = { stars: [0, 11], bpm: [150, 310] };

interface CollectionImportOptions {
  modifyCollectionDb: boolean;
  queueDownloads: boolean;
}

export function ElectronImportCollectionDialog({ onOpenSettings }: { onOpenSettings?: () => void }) {
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
  const [pathSep, setPathSep] = useState<string>('\\');
  useEffect(() => {
    window.ipc?.pathSep().then(setPathSep);
  }, []);
  const target = useImportTarget(pathSep);
  const { resetClient } = target;
  useEffect(() => {
    const collectionId = Number(uri?.match(/osucollector:\/\/collections\/(\d+)/)?.[1]);
    if (collectionId) {
      setOpen(true);
      resetClient();
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
  }, [uri, setCollectionId, mutateURI, resetClient]);

  useEffect(() => {
    window.ipc?.onURI(() => mutateURI());
  }, []);

  const { collection, isLoading } = useCollection(collectionId);

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

  const [options, setOptions] = useState(
    (() => {
      const [options, err] = JSONParse<CollectionImportOptions>(
        localStorage.getItem('collection-import-options') ?? undefined,
      );
      return options ?? { modifyCollectionDb: true, queueDownloads: true };
    })(),
  );
  const skipping = {
    modifyCollectionDb: !options.modifyCollectionDb || Boolean(target.collectionsDisabledReason),
    queueDownloads: !options.queueDownloads || Boolean(target.downloadsDisabledReason),
  };
  const openSettings = onOpenSettings
    ? () => {
        setOpen(false);
        onOpenSettings();
      }
    : undefined;

  const [modifyingCollectionDb, setModifyingCollectionDb] = useState(false);
  const [submit, submitting] = useSubmit(async () => {
    localStorage.setItem('collection-import-options', JSON.stringify(options));
    if (!user) {
      toast({ title: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    // for osu!lazer, the app decides whether collections can be added while the game is running
    const isOsuRunning = target.client === 'stable' && (await window.ipc.checkIfOsuIsRunning());
    if (isOsuRunning) {
      throw new DisplayableError('osu! is currently running! Please close it and try again.');
    }

    if (!skipping.modifyCollectionDb) {
      setModifyingCollectionDb(true);
      const [_, collectionDbError] = await tryCatch(
        window.ipc.mergeCollectionDb({ collectionId: collectionId!, osuClient: target.client }),
      );
      setModifyingCollectionDb(false);
      if (collectionDbError) {
        throw new DisplayableError(collectionDbError.message);
      }
      toast(collectionsAddedToast(target.client));
    }

    if (!skipping.queueDownloads) {
      const payload = {
        osuClient: target.client,
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
      toast(downloadsStartedToast(target, filteredBeatmapsetIds.length));
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
          <ImportTargetSwitch target={target} />
          <DialogDescription asChild>
            <div className='flex max-h-[calc(100vh-200px)] flex-col gap-4 overflow-y-auto'>
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
                    {target.collectionsStepLabel}{' '}
                    {skipping.modifyCollectionDb && (
                      <span className={cn(options.modifyCollectionDb && 'text-red-400')}>(skipping)</span>
                    )}
                  </span>
                </div>
                <CollectionsStepDetails
                  target={target}
                  enabled={options.modifyCollectionDb}
                  skipping={skipping.modifyCollectionDb}
                  sizeIncrease={formatBytes(32 * (collection?.beatmapCount ?? 0), 1)}
                  onOpenSettings={openSettings}
                />
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
                <DownloadsStepDetails
                  target={target}
                  enabled={options.queueDownloads}
                  skipping={skipping.queueDownloads}
                  estimatedSize={formatBytes(filteredBeatmapsetIds.length * 10 * ONE_MEGABYTE)}
                  onOpenSettings={openSettings}
                />
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
            </div>
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
          <DialogTitle>Modifying {target.collectionsFilename}...</DialogTitle>

          <DialogDescription className='flex max-h-[calc(100vh-200px)] flex-col items-center gap-2 overflow-y-auto'>
            <RefreshCw className='h-8 w-8 animate-spin' />
            Please wait...
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

const className = {
  graphTitle: cn('font-semibold text-white text-lg'),
  graph: cn('transition-all px-6 pb-2 h-[130px] rounded-lg', 'lg:h-[120px]'),
};
