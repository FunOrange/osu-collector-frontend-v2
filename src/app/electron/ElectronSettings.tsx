import { Channel } from '@/app/electron/ipc-types';
import { Preferences } from '@/app/electron/preferences';
import { Button } from '@/components/shadcn/button';
import { Checkbox } from '@/components/shadcn/checkbox';
import { Input } from '@/components/shadcn/input';
import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { useToast } from '@/components/shadcn/use-toast';
import useSubmit from '@/hooks/useSubmit';
import { cn } from '@/utils/shadcn-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';
import { assoc, omit } from 'ramda';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { match } from 'ts-pattern';

export default function ElectronSettings() {
  const { toast } = useToast();
  const [pathSep, setPathSep] = useState<string>('\\');
  useEffect(() => {
    window.ipc?.pathSep().then(setPathSep);
  }, []);
  const trimPath = (path: string | undefined) => path?.replace(new RegExp(pathSep + '+$'), '');
  const { data: preferences, mutate: mutatePreferences } = useSWR(Channel.GetPreferences, window.ipc?.getPreferences);
  const [touchedFields, setTouchedFields] = useState<Preferences>({});
  const fields: Preferences = {
    ...preferences,
    ...touchedFields,
  };

  const mutateRelatedChannels = () => {
    mutate(swrKeyIncludes(Channel.GetPreferences));
    mutate(swrKeyIncludes(Channel.GetDownloadDirectory));
    mutate(swrKeyIncludes(Channel.PathExists));
  };

  const computedFields = (key: 'osuSongsDirectory' | 'downloadDirectoryOverride') =>
    match(key)
      .with(
        'osuSongsDirectory',
        () => fields.osuSongsDirectory || fields.osuInstallDirectory?.concat(pathSep + 'Songs'),
      )
      .with('downloadDirectoryOverride', () => fields.downloadDirectoryOverride || computedFields('osuSongsDirectory'))
      .exhaustive();
  const [setPreference] = useSubmit(async (key: keyof Preferences, value: any) => {
    if (value === undefined) return;
    await mutatePreferences(
      window.ipc.setPreferences({ ...preferences, [key]: value }).then(window.ipc.getPreferences),
      { optimisticData: assoc(key, value) },
    );
    mutateRelatedChannels();
    setTouchedFields(omit([key]));
    toast({ title: 'Preference updated!', description: 'Changes have been saved.' });
  });

  const selectFolder = async (key: 'osuInstallDirectory' | 'osuSongsDirectory' | 'downloadDirectoryOverride') => {
    const path = await window.ipc.openFolderDialog();
    if (path) {
      await mutatePreferences(
        window.ipc.setPreferences({ ...preferences, [key]: path }).then(window.ipc.getPreferences),
        { optimisticData: assoc(key, path) },
      );
      mutateRelatedChannels();
      setTouchedFields(omit([key]));
      toast({ title: 'Preference updated!', description: 'Changes have been saved.' });
    }
  };

  const pathInputProps = (key: 'osuInstallDirectory' | 'osuSongsDirectory' | 'downloadDirectoryOverride') => ({
    parentClassName: 'w-full',
    className: 'w-full rounded-r-none',
    value: fields[key] ?? '',
    onChange: (e: any) => setTouchedFields(assoc(key, e.target.value)),
    onBlur: async (e: any) => {
      const value = trimPath(e.target.value)?.trim();
      if (value === preferences?.[key]) return;
      const exists = await window.ipc.pathExists(value);
      if (value && !exists) {
        toast({ title: 'Path does not exist', description: value, variant: 'destructive' });
      } else {
        setPreference(key, value);
      }
    },
    onKeyDown: (e: any) => {
      if (e.key === 'Enter') {
        pathInputProps(key).onBlur(e);
      }
    },
  });

  return (
    <main className='w-full'>
      <section className='flex h-12 items-center justify-between gap-2 bg-slate-900 px-2 py-1'>
        <SidebarTrigger />
        <div className='flex items-center gap-1 p-1'>
          <Button
            variant='ghost'
            size='sm'
            className='text-slate-400 hover:bg-slate-500/30'
            onClick={() => window.ipc.openDevTools()}
          >
            Open DevTools
          </Button>
          {/* <Button variant='ghost' size='sm' className='text-slate-400 hover:bg-slate-500/30'> */}
          {/*   Special login */}
          {/* </Button> */}
        </div>
      </section>

      <div className='flex w-full max-w-screen-md flex-col gap-4 p-4'>
        <div>
          <h3 className='mb-1 text-white'>File Paths</h3>
          <hr className='border-white/20' />
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <div className='text-sm text-white'>osu! install folder</div>
            <div className={cn('text-xs transition-colors', !fields.osuInstallDirectory && 'text-red-400')}>
              required
            </div>
          </div>
          <div className='flex w-full'>
            <Input {...pathInputProps('osuInstallDirectory')} />
            <Button variant='outline' className='rounded-l-none' onClick={() => selectFolder('osuInstallDirectory')}>
              Browse
            </Button>
          </div>
          <div className='text-xs text-slate-400'>
            This is where osu! stable is installed. This folder should contain osu!.exe. You <i>can</i> set it to an
            osu!lazer install folder, but please note that in-game collection management will not work.
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <div className='text-sm text-white'>osu! songs folder</div>
            <div className='text-xs text-slate-500'>optional</div>
          </div>
          <div className='flex w-full'>
            <Input placeholder={computedFields('osuSongsDirectory')} {...pathInputProps('osuSongsDirectory')} />
            <Button variant='outline' className='rounded-l-none' onClick={() => selectFolder('osuSongsDirectory')}>
              Browse
            </Button>
          </div>
          <div className='text-xs text-slate-400'>
            osu!Collector will download .osz files to this location by default. When downloaded here, osu! stable will
            automatically detect and import all downloaded .osz files.
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <div className='text-sm text-white'>download folder override</div>
            <div className='text-xs text-slate-500'>
              optional for osu! stable,{' '}
              <span className={cn(preferences?.downloadDirectoryOverride ? 'text-slate-300' : 'text-red-400/70')}>
                required for osu!lazer
              </span>
            </div>
          </div>
          <div className='flex w-full'>
            <Input
              placeholder={computedFields('downloadDirectoryOverride')}
              {...pathInputProps('downloadDirectoryOverride')}
            />
            <Button
              variant='outline'
              className='rounded-l-none'
              onClick={() => selectFolder('downloadDirectoryOverride')}
            >
              Browse
            </Button>
          </div>
          <div className='text-xs text-slate-400'>You can use this to download .osz files to a different location</div>
        </div>

        <div>
          <h3 className='mb-1 text-white'>Downloads</h3>
          <hr className='border-white/20' />
        </div>

        <div className='flex flex-col gap-1'>
          <div className='text-sm text-white'>max parallel downloads</div>
          <Input
            className='max-w-40 w-full'
            type='number'
            placeholder='5'
            min={1}
            max={30}
            step={1}
            value={fields.maxParallelDownloads ?? ''}
            onChange={(e) => setTouchedFields(assoc('maxParallelDownloads', e.target.value))}
            onBlur={(e) => {
              const raw = e.target.value?.trim();
              const parsed = Number(raw);
              const value = raw === '' || !Number.isFinite(parsed) ? undefined : Math.min(32, Math.max(1, parsed));
              setPreference('maxParallelDownloads', value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <div className='text-xs text-slate-400'>Limits how many beatmaps download at the same time.</div>
        </div>

        <div className='mt-4'>
          <h3 className='mb-1 text-white'>Importing Collections</h3>
          <hr className='border-white/20' />
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <div className='text-sm text-white'>imported collection name</div>
            <div className='text-xs text-slate-500'>optional</div>
          </div>
          <Input
            className='w-full'
            placeholder='o!c - ${uploader} - ${collectionName}'
            value={fields.importedCollectionNameFormat ?? ''}
            onChange={(e) => setTouchedFields(assoc('importedCollectionNameFormat', e.target.value))}
            onBlur={() =>
              setPreference('importedCollectionNameFormat', touchedFields.importedCollectionNameFormat?.trim())
            }
          />
          <div className='text-xs text-slate-400'>
            When importing a collection to osu, this name template will be used.
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='mb-1 text-white'>Operating System Integration</h3>
          <hr className='border-white/20' />
        </div>

        <label
          htmlFor='launch-on-startup-checkbox'
          className={cn(
            'flex flex-col gap-1 self-start rounded p-2',
            'cursor-pointer transition-colors hover:bg-slate-700',
          )}
        >
          <div className='flex items-center gap-2'>
            <Checkbox
              id='launch-on-startup-checkbox'
              checked={preferences?.launchOnStartup ?? false}
              onCheckedChange={(checked) => setPreference('launchOnStartup', checked as boolean)}
            />
            <span className='text-sm text-white'>launch on startup</span>
          </div>
          <span className='text-xs text-slate-400'>Launch the app when the system starts up.</span>
        </label>

        <label
          htmlFor='minimize-to-system-tray-checkbox'
          className={cn(
            'flex flex-col gap-1 self-start rounded p-2',
            'cursor-pointer transition-colors hover:bg-slate-700',
          )}
        >
          <div className='flex items-center gap-2'>
            <Checkbox
              id='minimize-to-system-tray-checkbox'
              checked={preferences?.minimizeToTray ?? false}
              onCheckedChange={(checked) => setPreference('minimizeToTray', checked as boolean)}
            />
            <span className='text-sm text-white'>minimize to system tray</span>
          </div>
          <span className='text-xs text-slate-400'>
            When closing the window, the app will minimize to the system tray instead of closing.
          </span>
        </label>

        <label
          htmlFor='desktop-notifications-checkbox'
          className={cn(
            'flex flex-col gap-1 self-start rounded p-2',
            'cursor-pointer transition-colors hover:bg-slate-700',
          )}
        >
          <div className='flex items-center gap-2'>
            <Checkbox
              id='desktop-notifications-checkbox'
              checked={preferences?.notifyOnDownloadsComplete ?? false}
              onCheckedChange={(checked) => setPreference('notifyOnDownloadsComplete', checked as boolean)}
            />
            <span className='text-sm text-white'>desktop notifications</span>
          </div>
          <div className='text-xs text-slate-400'>Show a desktop notification when downloads are complete.</div>
        </label>
      </div>
    </main>
  );
}
