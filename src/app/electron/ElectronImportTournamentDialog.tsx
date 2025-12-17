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
import { assoc, sum } from 'ramda';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';

export type TournamentImportMethod = 'tournament' | 'round' | 'mod' | 'beatmap';

interface TournamentImportOptions {
  importMethod: TournamentImportMethod | null;
  queueDownloads: boolean;
}

export function ElectronImportTournamentDialog() {
  const { toast } = useToast();
  const { user } = useUser();
  const { data: uri, mutate: mutateURI } = useSWR(window.ipc && Channel.GetURI, window.ipc?.getURI);
  const [tournamentId, setTournamentId] = useState<number | undefined>();
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    const tournamentId = Number(uri?.match(/osucollector:\/\/tournaments\/(\d+)/)?.[1]);
    if (tournamentId) {
      setOpen(true);
      setTournamentId(tournamentId);
      mutateURI(window.ipc.clearURI().then(() => undefined));
    }
  }, [uri, setTournamentId, mutateURI]);

  useEffect(() => {
    window.ipc?.onURI(() => mutateURI());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: preferences } = useSWR(Channel.GetPreferences, () => window.ipc?.getPreferences());
  const { data: downloadDirectory } = useSWR(Channel.GetDownloadDirectory, () => window.ipc?.getDownloadDirectory());
  const { data: downloadDirectoryExists } = useSWR([Channel.PathExists, downloadDirectory], ([_, path]) =>
    window.ipc?.pathExists(path),
  );
  const [pathSep, setPathSep] = useState<string>('\\');
  useEffect(() => {
    window.ipc?.pathSep().then(setPathSep);
  }, []);
  const collectionDbPath = preferences?.osuInstallDirectory! + pathSep + 'collection.db';
  const { data: collectionDbExists } = useSWR([Channel.PathExists, collectionDbPath], ([_, path]) =>
    window.ipc?.pathExists(path),
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
      const [options, err] = JSONParse<TournamentImportOptions>(
        localStorage.getItem('tournament-import-options') ?? undefined,
      );
      return options ?? { importMethod: null, queueDownloads: true };
    })(),
  );

  const skipping = {
    modifyCollectionDb: !options.importMethod || Boolean(mergeDisabledReason),
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
    localStorage.setItem('tournament-import-options', JSON.stringify(options));
    if (!user) {
      toast({ title: 'Please log in to continue', variant: 'destructive' });
      return;
    }

    const isOsuRunning = await window.ipc.checkIfOsuIsRunning();
    if (isOsuRunning) {
      throw new DisplayableError('osu! is currently running! Please close it and try again.');
    }

    if (!skipping.modifyCollectionDb) {
      setModifyingCollectionDb(true);
      const [_, collectionDbError] = await tryCatch(
        window.ipc.mergeCollectionDb({ tournamentId: tournamentId!, groupBy: options.importMethod! }),
      );
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
      const payload = {
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
      toast({
        title: 'Downloads started!',
        description: getBeatmapsetIds(tournament).length + ' maps have been queued for download',
      });
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
          <DialogDescription className='flex max-h-[calc(100vh-200px)] flex-col items-start gap-4 overflow-y-auto'>
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
                    modify collection.db file {skipping.modifyCollectionDb && `(skipping)`}
                  </span>
                </div>
                <div>
                  <div className='text-xs'>This will allow the collection to appear in osu! stable</div>
                  <div className='whitespace-pre-line text-xs text-red-400'>
                    {Boolean(options.importMethod) && mergeDisabledReason}
                  </div>
                </div>
                <WindowsFileExplorer
                  addressBar={preferences?.osuInstallDirectory}
                  className={cn('mt-2', fadeOutStyle(Boolean(skipping.modifyCollectionDb)))}
                >
                  <div className='flex flex-col items-center gap-1 text-white'>
                    <File className='h-8 w-8' />
                    <div className='text-xs'>collection.db</div>
                    <div className='text-xs text-green-400'>+{formatBytes(collectionDbSizeIncrease())}</div>
                  </div>
                </WindowsFileExplorer>
              </label>

              <div
                className={cn('transition-[opacity]', skipping.modifyCollectionDb && 'pointer-events-none opacity-60')}
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
              <div>
                <div className='text-xs'>
                  Estimated size of all items: {formatBytes(getBeatmapsetIds(tournament).length * 10 * ONE_MEGABYTE)}
                </div>
                <div className='text-xs'>osu!Collector will skip the maps you already have</div>
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
          <DialogTitle>Modifying collection.db...</DialogTitle>

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
  tournament?.rounds.flatMap((r) => r.mods.flatMap((m) => m.maps.map((map) => map.beatmapset.id))) ?? [];

interface WindowsFileExplorerProps {
  addressBar: string | undefined;
  children: ReactNode;
  className?: string;
}
function WindowsFileExplorer({ addressBar, children, className }: WindowsFileExplorerProps) {
  return (
    <div className={cn('rounded border border-black/50 bg-[#1F1F1F]', className)}>
      <div className='flex items-center gap-2 px-2 py-2 text-white'>
        <ArrowLeft className='text-md' color='currentColor' />
        <ArrowRight className='text-md text-gray-400' color='currentColor' />
        <ArrowUp className='text-md' color='currentColor' />
        <div className='bg-slate line-clamp-1 flex items-center justify-between gap-4 rounded bg-[#2D2C2C] px-2 py-1 text-xs'>
          {addressBar}
          <ArrowClockwise className='text-md text-gray-400' color='currentColor' />
        </div>
      </div>
      <div className='flex flex-col items-start bg-[#191919] p-4'>{children}</div>
    </div>
  );
}
