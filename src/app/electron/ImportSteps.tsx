import { useImportTarget } from '@/app/electron/useImportTarget';
import { OsuClient } from '@/app/electron/preferences';
import { cn } from '@/utils/shadcn-utils';
import { File, Gamepad2 } from 'lucide-react';
import { ReactNode } from 'react';
import { ArrowClockwise, ArrowLeft, ArrowRight, ArrowUp, ThreeDots } from 'react-bootstrap-icons';

// Shared parts of the collection and tournament import dialogs

type ImportTarget = ReturnType<typeof useImportTarget>;

const fadeOutStyle = (condition: boolean) =>
  cn('transition-[transform,opacity]', condition && 'translate-y-[2px] opacity-40');

function DisabledReason({ reason, onOpenSettings }: { reason: string | false; onOpenSettings?: () => void }) {
  if (!reason) return null;
  return (
    <div className='whitespace-pre-line text-xs text-red-400'>
      {reason}
      {onOpenSettings && (
        <>
          {' '}
          <span
            className='cursor-pointer text-blue-400 hover:underline'
            onClick={(e) => {
              e.preventDefault();
              onOpenSettings();
            }}
          >
            Open settings
          </span>
        </>
      )}
    </div>
  );
}

interface CollectionsStepDetailsProps {
  target: ImportTarget;
  enabled: boolean;
  skipping: boolean;
  /** shown on the collection.db file, eg. "+12 KB" */
  sizeIncrease: string;
  onOpenSettings?: () => void;
}
export function CollectionsStepDetails({
  target,
  enabled,
  skipping,
  sizeIncrease,
  onOpenSettings,
}: CollectionsStepDetailsProps) {
  const lazerRunningNote = target.lazer?.canAddCollectionsWhileRunning
    ? 'osu!lazer can stay open.'
    : 'Please close osu!lazer first.';
  return (
    <>
      <div>
        <div className='text-xs'>
          {target.client === 'lazer'
            ? `This will add the collection to osu!lazer. ${target.supported ? lazerRunningNote : ''}`
            : 'This will allow the collection to appear in osu! stable. PLEASE restart your game after!!!'}
        </div>
        {enabled && <DisabledReason reason={target.collectionsDisabledReason} onOpenSettings={onOpenSettings} />}
      </div>
      {target.client === 'lazer' && target.supported ? (
        <GameBox client='lazer' className={cn('mt-2', fadeOutStyle(skipping))}>
          <div className='text-xs text-green-400'>+ collection</div>
        </GameBox>
      ) : (
        <WindowsFileExplorer addressBar={target.stableDirectory} className={cn('mt-2', fadeOutStyle(skipping))}>
          <div className='flex flex-col items-center gap-1 text-white'>
            <File className='h-8 w-8' />
            <div className='text-xs'>{target.collectionsFilename}</div>
            <div className='text-xs text-green-400'>+{sizeIncrease}</div>
          </div>
        </WindowsFileExplorer>
      )}
    </>
  );
}

interface DownloadsStepDetailsProps {
  target: ImportTarget;
  enabled: boolean;
  skipping: boolean;
  estimatedSize: string;
  onOpenSettings?: () => void;
}
export function DownloadsStepDetails({
  target,
  enabled,
  skipping,
  estimatedSize,
  onOpenSettings,
}: DownloadsStepDetailsProps) {
  const oszFile = (
    <div className='flex flex-col items-center gap-1'>
      <File className='h-8 w-8' />
      <div className='text-xs text-white'>.osz</div>
    </div>
  );
  const oszFiles = (
    <div className='text-white'>
      <div className='flex items-center gap-3'>
        {oszFile}
        {oszFile}
        {oszFile}
        {oszFile}
        <ThreeDots className='ml-1 text-xl text-gray-400' color='currentColor' />
      </div>
    </div>
  );
  return (
    <>
      <div>
        <div className='text-xs'>Estimated size of all items: {estimatedSize}</div>
        <div className='text-xs'>osu!Collector will skip the maps you already have</div>
        {target.client === 'lazer' &&
          (target.importsMapsIntoLazer || !target.supported ? (
            <div className='text-xs'>
              Downloaded maps will be imported into osu!lazer automatically. osu!lazer will open if it isn&apos;t
              already running.
            </div>
          ) : (
            <div className='text-xs'>
              osu!lazer could not be found on this computer, so downloaded maps need to be imported manually (drag them
              into the osu!lazer window).
            </div>
          ))}
        {enabled && <DisabledReason reason={target.downloadsDisabledReason} onOpenSettings={onOpenSettings} />}
      </div>
      {target.importsMapsIntoLazer ? (
        <GameBox client='lazer' className={cn('mt-2', fadeOutStyle(skipping))}>
          {oszFiles}
        </GameBox>
      ) : (
        <WindowsFileExplorer addressBar={target.downloadDirectory} className={cn('mt-2', fadeOutStyle(skipping))}>
          {oszFiles}
        </WindowsFileExplorer>
      )}
    </>
  );
}

export function collectionsAddedToast(client: OsuClient, plural = false) {
  return client === 'lazer'
    ? {
        title: plural ? 'Collections added to osu!lazer!' : 'Collection added to osu!lazer!',
        description: `If osu!lazer is open, ${plural ? 'they' : 'it'} should appear right away`,
      }
    : { title: 'collection.db successfully modified!', description: 'Please restart osu!' };
}

export function downloadsStartedToast(target: ImportTarget, count: number) {
  return {
    title: 'Downloads started!',
    description: target.importsMapsIntoLazer
      ? `${count} maps have been queued for download, and will be imported into osu!lazer`
      : `${count} maps have been queued for download`,
  };
}

/** Stands in for a file explorer window when the game's files are managed automatically. */
function GameBox({ client, children, className }: { client: OsuClient; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded border border-black/50 bg-[#1F1F1F]', className)}>
      <div className='flex items-center gap-2 px-3 py-2 text-xs text-white'>
        <Gamepad2 className='h-4 w-4' />
        {client === 'lazer' ? 'osu!lazer' : 'osu! stable'}
      </div>
      <div className='flex flex-col items-start bg-[#191919] p-4'>{children}</div>
    </div>
  );
}

interface WindowsFileExplorerProps {
  addressBar: string | undefined;
  children: ReactNode;
  className?: string;
}
export function WindowsFileExplorer({ addressBar, children, className }: WindowsFileExplorerProps) {
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
