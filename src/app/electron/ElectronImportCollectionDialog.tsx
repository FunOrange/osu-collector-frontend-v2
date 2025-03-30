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
import { assoc } from 'ramda';
import { ArrowClockwise, ArrowLeft, ArrowRight, ArrowUp, ThreeDots } from 'react-bootstrap-icons';
import { File, RefreshCw } from 'lucide-react';
import { formatBytes } from '@/utils/string-utils';
import useSubmit, { DisplayableError } from '@/hooks/useSubmit';
import { JSONParse } from '@/utils/object-utils';
import { tryCatch } from '@/utils/try-catch';
import { useToast } from '@/components/shadcn/use-toast';
import { ONE_MEGABYTE } from '@/utils/number-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';

interface ImportOptions {
  modifyCollectionDb: boolean;
  queueDownloads: boolean;
}

export function ElectronImportCollectionDialog() {
  const { toast } = useToast();
  const { data: uri, mutate: mutateURI } = useSWR(window.ipc && Channel.GetURI, window.ipc?.getURI);
  const [collectionId, setCollectionId] = useState<number | undefined>();
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    const collectionId = Number(uri?.match(/osucollector:\/\/collections\/(\d+)/)?.[1]);
    if (collectionId) {
      setOpen(true);
      setCollectionId(collectionId);
      mutateURI(window.ipc.clearURI().then(() => undefined));
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
    window.ipc?.pathExists(path),
  );
  const pathSep = useClientValue(window.ipc?.pathSep, '\\');
  const collectionDbPath = preferences?.osuInstallDirectory + pathSep + 'collection.db';
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
      const [options, err] = JSONParse<ImportOptions>(localStorage.getItem('osu-collector-import-settings'));
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
    localStorage.setItem('osu-collector-import-settings', JSON.stringify(options));

    const isOsuRunning = await window.ipc.checkIfOsuIsRunning();
    if (isOsuRunning) {
      throw new DisplayableError('osu! is currently running! Please close it and try again.');
    }

    if (!skipping.modifyCollectionDb) {
      setModifyingCollectionDb(true);
      const [_, collectionDbError] = await tryCatch(window.ipc.mergeCollectionDb(collectionId!));
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
        beatmapsetIds: collection?.beatmapsets.map((b) => b.id),
        metadata: {
          collection: {
            id: collectionId,
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
                  modify collection.db file {skipping.modifyCollectionDb && `(skipping)`}
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
                  download maps {skipping.queueDownloads && `(skipping)`}
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
  addressBar: string;
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
