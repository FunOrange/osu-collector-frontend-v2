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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import { useTournament, useUser } from '@/services/osu-collector-api-hooks';
import { Skeleton } from '@/components/shadcn/skeleton';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import { Checkbox } from '@/components/shadcn/checkbox';
import { assoc, sum, uniq } from 'ramda';
import { ArrowClockwise, ArrowLeft, ArrowRight, ArrowUp, ThreeDots } from 'react-bootstrap-icons';
import { File, RefreshCw } from 'lucide-react';
import { formatBytes } from '@/utils/string-utils';
import useSubmit, { DisplayableError } from '@/hooks/useSubmit';
import { JSONParse } from '@/utils/object-utils';
import { tryCatch } from '@/utils/try-catch';
import { useToast } from '@/components/shadcn/use-toast';
import { ONE_MEGABYTE } from '@/utils/number-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';
import { match } from 'ts-pattern';
import { Tournament } from '@/shared/entities/v1';
import { ImportTargetSwitch, useImportTarget } from '@/app/electron/useImportTarget';
import {
  collectionsAddedToast,
  CollectionsStepDetails,
  downloadsStartedToast,
  DownloadsStepDetails,
} from '@/app/electron/ImportSteps';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';

export type TournamentImportMethod = 'tournament' | 'round' | 'mod' | 'beatmap';

interface TournamentImportOptions {
  importMethod: TournamentImportMethod | null;
  queueDownloads: boolean;
}

export function ElectronImportTournamentDialog({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { toast } = useToast();
  const { user } = useUser();
  const { data: uri, mutate: mutateURI } = useSWR(window.ipc && Channel.GetURI, window.ipc?.getURI);
  const [tournamentId, setTournamentId] = useState<number | undefined>();
  const [open, setOpen] = useState<boolean>(false);
  const [pathSep, setPathSep] = useState<string>('\\');
  useEffect(() => {
    window.ipc?.pathSep().then(setPathSep);
  }, []);
  const target = useImportTarget(pathSep);
  const { resetClient } = target;
  useEffect(() => {
    const tournamentId = Number(uri?.match(/osucollector:\/\/tournaments\/(\d+)/)?.[1]);
    if (tournamentId) {
      setOpen(true);
      resetClient();
      setTournamentId(tournamentId);
      mutateURI(window.ipc.clearURI().then(() => undefined));
    }
  }, [uri, setTournamentId, mutateURI, resetClient]);

  useEffect(() => {
    window.ipc?.onURI(() => mutateURI());
  }, []);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const [options, setOptions] = useState(
    (() => {
      const [options, err] = JSONParse<TournamentImportOptions>(
        localStorage.getItem('tournament-import-options') ?? undefined,
      );
      return options ?? { importMethod: null, queueDownloads: true };
    })(),
  );

  const skipping = {
    modifyCollectionDb: !options.importMethod || Boolean(target.collectionsDisabledReason),
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
    localStorage.setItem('tournament-import-options', JSON.stringify(options));
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
        window.ipc.mergeCollectionDb({
          tournamentId: tournamentId!,
          groupBy: options.importMethod!,
          osuClient: target.client,
        }),
      );
      setModifyingCollectionDb(false);
      if (collectionDbError) {
        throw new DisplayableError(collectionDbError.message);
      }
      toast(collectionsAddedToast(target.client, true));
    }

    if (!skipping.queueDownloads) {
      const payload = {
        osuClient: target.client,
        beatmapsetIds: getBeatmapsetIds(tournament),
        metadata: {
          tournament: {
            id: tournamentId!,
            name: tournament!.name,
            uploader: {
              id: tournament!.uploader.id,
              username: tournament!.uploader.username,
            },
          },
        },
      };
      const [__, downloadsError] = await tryCatch(window.ipc.addDownloads(payload));
      mutate(swrKeyIncludes(Channel.GetDownloads));
      if (downloadsError) {
        throw new DisplayableError(downloadsError.message);
      }
      toast(downloadsStartedToast(target, getBeatmapsetIds(tournament).length));
    }
    setOpen(false);
  });

  const collectionDbSizeIncrease = () => {
    if (!tournament) return 0;
    const collections = getCollectionsSchema(tournament, options.importMethod ?? 'tournament');
    const addOverhead = (size: number) => size + 2;
    const collectionNamesSize = sum(collections.map((c) => c.name.length).map(addOverhead));
    const checksumsSize = sum(collections.map((c) => c.maps.length * 32).map(addOverhead));
    return collectionNamesSize + checksumsSize;
  };

  const withTooltip = (groupBy: TournamentImportMethod, children: ReactNode) => {
    const collections = getCollectionsSchema(tournament, groupBy);
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>
          <div className='mb-1 text-xs text-slate-300'>
            This will add {collections.length} collection{groupBy !== 'tournament' && 's'} to your game:
          </div>
          {collections.slice(0, 5).map((c, i) => (
            <div key={i}>{c.name}</div>
          ))}
          {collections.length > 5 && <div className='text-xs text-slate-300'>...and {collections.length - 5} more</div>}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          // className='max-w-[800px]'
        >
          <Skeleton loading={isLoading} className='min-h-[38px]'>
            <DialogTitle className='mb-1'>{tournament?.name}</DialogTitle>
            <div className='text-xs text-slate-400'>uploaded by {tournament?.uploader.username}</div>
          </Skeleton>
          <ImportTargetSwitch target={target} />
          <DialogDescription asChild>
            <div className='flex max-h-[calc(100vh-200px)] flex-col items-start gap-4 overflow-y-auto'>
              <div className='flex flex-col gap-1'>
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
                      checked={Boolean(options.importMethod)}
                      onCheckedChange={(checked) => setOptions(assoc('importMethod', checked ? 'tournament' : null))}
                    />
                    <span className={cn('text-sm', !skipping.modifyCollectionDb && 'text-white')}>
                      {target.collectionsStepLabel} {skipping.modifyCollectionDb && `(skipping)`}
                    </span>
                  </div>
                  <CollectionsStepDetails
                    target={target}
                    enabled={Boolean(options.importMethod)}
                    skipping={skipping.modifyCollectionDb}
                    sizeIncrease={formatBytes(collectionDbSizeIncrease())}
                    onOpenSettings={openSettings}
                  />
                </label>

                <div
                  className={cn(
                    'transition-[opacity]',
                    skipping.modifyCollectionDb && 'pointer-events-none opacity-60',
                  )}
                >
                  <div className='text-xs'>(optional) import as multiple collections grouped by:</div>
                  <Tabs
                    defaultValue='tournament'
                    value={options.importMethod ?? undefined}
                    onValueChange={(value) => setOptions(assoc('importMethod', value))}
                  >
                    <TabsList className='gap-1 bg-slate-800 shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]'>
                      <TooltipProvider>
                        {withTooltip('tournament', <TabsTrigger value='tournament'>none</TabsTrigger>)}
                        {withTooltip('round', <TabsTrigger value='round'>round</TabsTrigger>)}
                        {withTooltip('mod', <TabsTrigger value='mod'>mod</TabsTrigger>)}
                        {withTooltip('beatmap', <TabsTrigger value='beatmap'>beatmap</TabsTrigger>)}
                      </TooltipProvider>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <label
                htmlFor='queue-downloads-checkbox'
                className={cn(
                  'flex flex-col items-start gap-1 self-start rounded p-2',
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
                    download maps {skipping.queueDownloads && `(skipping)`}
                  </span>
                </div>
                <DownloadsStepDetails
                  target={target}
                  enabled={options.queueDownloads}
                  skipping={skipping.queueDownloads}
                  estimatedSize={formatBytes(getBeatmapsetIds(tournament).length * 10 * ONE_MEGABYTE)}
                  onOpenSettings={openSettings}
                />
              </label>
            </div>
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant='important'
              disabled={!tournamentId || (skipping.modifyCollectionDb && skipping.queueDownloads)}
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

const getCollectionsSchema = (tournament: Tournament | undefined, method: TournamentImportMethod | null) => {
  if (!method) return [];
  if (!tournament) return [];
  return match(method)
    .with('tournament', () => [
      {
        name: tournament.name,
        maps: tournament.rounds.flatMap((r) => r.mods).flatMap((m) => m.maps),
      },
    ])
    .with('round', () =>
      tournament.rounds.map((r) => ({
        name: tournament.name + ' - ' + r.round,
        maps: r.mods.flatMap((m) => m.maps),
      })),
    )
    .with('mod', () =>
      tournament.rounds.flatMap((r) =>
        r.mods.map((m) => ({
          name: tournament.name + ' - ' + r.round + ' ' + m.mod,
          maps: m.maps,
        })),
      ),
    )
    .with('beatmap', () =>
      tournament.rounds.flatMap((r) =>
        r.mods.flatMap((m) =>
          m.maps.map((map, modIndex) => ({
            name: tournament.name + ' - ' + r.round + ' ' + m.mod + modIndex,
            maps: [map],
          })),
        ),
      ),
    )
    .exhaustive();
};

const getBeatmapsetIds = (tournament: Tournament | undefined) =>
  uniq(tournament?.rounds.flatMap((r) => r.mods.flatMap((m) => m.maps.map((map) => map.beatmapset.id))) ?? []);
