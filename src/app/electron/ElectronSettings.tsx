import { Channel } from '@/app/electron/ipc-types';
import { OsuClient, Preferences } from '@/app/electron/preferences';
import { useOsuClients } from '@/app/electron/useOsuClients';
import { osuClientNames } from '@/app/electron/useImportTarget';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group';
import { Button } from '@/components/shadcn/button';
import { Checkbox } from '@/components/shadcn/checkbox';
import { Input } from '@/components/shadcn/input';
import { SidebarTrigger } from '@/components/shadcn/sidebar';
import { useToast } from '@/components/shadcn/use-toast';
import useSubmit from '@/hooks/useSubmit';
import { cn } from '@/utils/shadcn-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';
import { assoc, omit } from 'ramda';
import { ReactNode, useEffect, useState } from 'react';
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

  const { supported: osuClientsSupported, info: osuClients } = useOsuClients();
  const osuClient = fields.osuClient ?? osuClients?.osuClient;
  const stableExePath = fields.osuInstallDirectory && fields.osuInstallDirectory + pathSep + 'osu!.exe';
  const { data: stableFound } = useSWR(stableExePath ? [Channel.PathExists, stableExePath] : null, ([_, path]) =>
    window.ipc?.pathExists(path),
  );

  // older app versions ignore lazerDataDirectory
  const showLazerDataDirectory = !!osuClients?.lazer.supportsDataDirectoryPreference;
  const lazerRealmPath = preferences?.lazerDataDirectory && preferences.lazerDataDirectory + pathSep + 'client.realm';
  const { data: lazerRealmFound } = useSWR(lazerRealmPath ? [Channel.PathExists, lazerRealmPath] : null, ([_, path]) =>
    window.ipc?.pathExists(path),
  );

  const mutateRelatedChannels = () => {
    mutate(swrKeyIncludes(Channel.GetOsuClients));
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

  const selectFolder = async (key: PathPreference) => {
    const path =
      key === 'lazerExecutablePath' ? await window.ipc.openFileDialog?.() : await window.ipc.openFolderDialog();
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

  const pathInputProps = (key: PathPreference) => ({
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
        {osuClientsSupported ? (
          <>
            <div>
              <h3 className='mb-1 text-white'>Game</h3>
              <hr className='border-white/20' />
            </div>
            <div className='text-xs text-slate-400'>
              Collections and maps will be added to this game. You can also choose a different game when importing.
            </div>

            <RadioGroup
              value={osuClient ?? ''}
              onValueChange={(value) => setPreference('osuClient', value as OsuClient)}
              className='gap-3'
            >
              <GameOption value='lazer' selected={osuClient === 'lazer'}>
                {osuClients?.lazer.found ? (
                  <div className='flex items-center gap-3 text-xs'>
                    <span className='text-green-400'>✓ Found</span>
                    <span
                      className='cursor-pointer text-blue-400 hover:underline'
                      onClick={() => window.ipc.revealPath(osuClients.lazer.dataDirectory!)}
                    >
                      Open data folder
                    </span>
                  </div>
                ) : (
                  <div className='text-xs text-red-400'>
                    {osuClients?.lazer.supportsDataDirectoryPreference
                      ? "Couldn't find osu!lazer automatically. If it's installed, select its data folder below."
                      : 'Not found. Please install osu!lazer, or launch it once so it can create its data folder.'}
                  </div>
                )}
                {osuClients?.lazer.found && !osuClients.lazer.executableFound && (
                  <div className='mt-1 text-xs text-yellow-400'>
                    The osu!lazer program wasn&apos;t found, so downloaded maps won&apos;t be added to osu!lazer
                    automatically. Select it below to fix this.
                  </div>
                )}
                {showLazerDataDirectory && (
                  <div className='mt-2 flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm text-white'>osu!lazer data folder</div>
                      <div className='text-xs text-slate-500'>optional</div>
                    </div>
                    <div className='flex w-full'>
                      <Input
                        placeholder={preferences?.lazerDataDirectory ? undefined : osuClients?.lazer.dataDirectory}
                        {...pathInputProps('lazerDataDirectory')}
                      />
                      <Button
                        variant='outline'
                        className='rounded-l-none'
                        onClick={() => selectFolder('lazerDataDirectory')}
                      >
                        Browse
                      </Button>
                    </div>
                    {preferences?.lazerDataDirectory && lazerRealmFound === false && (
                      <div className='text-xs text-red-400'>client.realm was not found in this folder.</div>
                    )}
                    <div className='text-xs text-slate-400'>
                      The folder containing client.realm. Leave empty to detect it automatically. To find it, open
                      osu!lazer and go to Settings → General → Open osu! folder.
                    </div>
                  </div>
                )}
                <div className='mt-2 flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <div className='text-sm text-white'>osu!lazer program</div>
                    <div className='text-xs text-slate-500'>optional</div>
                  </div>
                  <div className='flex w-full'>
                    <Input {...pathInputProps('lazerExecutablePath')} />
                    <Button
                      variant='outline'
                      className='rounded-l-none'
                      onClick={() => selectFolder('lazerExecutablePath')}
                    >
                      Browse
                    </Button>
                  </div>
                  <div className='text-xs text-slate-400'>
                    eg. osu!.exe, osu!.app, or the osu!lazer AppImage. Leave empty to detect it automatically. Needed to
                    add downloaded maps to osu!lazer automatically.
                  </div>
                </div>
              </GameOption>

              <GameOption value='stable' selected={osuClient === 'stable'}>
                {stableFound ? (
                  <div className='text-xs text-green-400'>✓ Found</div>
                ) : (
                  <div className='text-xs text-red-400'>
                    Not found. Please set the folder osu! stable is installed to (the folder containing osu!.exe).
                  </div>
                )}
                <div className='mt-2 flex flex-col gap-1'>
                  <div className='text-sm text-white'>osu! stable install folder</div>
                  <div className='flex w-full'>
                    <Input {...pathInputProps('osuInstallDirectory')} />
                    <Button
                      variant='outline'
                      className='rounded-l-none'
                      onClick={() => selectFolder('osuInstallDirectory')}
                    >
                      Browse
                    </Button>
                  </div>
                </div>
                <div className='mt-2 flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <div className='text-sm text-white'>osu! songs folder</div>
                    <div className='text-xs text-slate-500'>optional</div>
                  </div>
                  <div className='flex w-full'>
                    <Input placeholder={computedFields('osuSongsDirectory')} {...pathInputProps('osuSongsDirectory')} />
                    <Button
                      variant='outline'
                      className='rounded-l-none'
                      onClick={() => selectFolder('osuSongsDirectory')}
                    >
                      Browse
                    </Button>
                  </div>
                  <div className='text-xs text-slate-400'>
                    osu!Collector will download .osz files to this location by default. When downloaded here, osu!
                    stable will automatically detect and import all downloaded .osz files.
                  </div>
                </div>
              </GameOption>
            </RadioGroup>

            {(osuClient === 'stable' || !osuClients?.lazer.executableFound) && (
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <div className='text-sm text-white'>
                    {osuClient === 'stable' ? 'download folder override' : 'download folder'}
                  </div>
                  <div className='text-xs text-slate-500'>optional</div>
                </div>
                <div className='flex w-full'>
                  <Input
                    placeholder={osuClient === 'stable' ? computedFields('downloadDirectoryOverride') : undefined}
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
                <div className='text-xs text-slate-400'>
                  {osuClient === 'stable'
                    ? 'You can use this to download .osz files to a different location.'
                    : 'Downloaded .osz files are saved here. To add them to osu!lazer, drag them into the osu!lazer window.'}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
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
                <Button
                  variant='outline'
                  className='rounded-l-none'
                  onClick={() => selectFolder('osuInstallDirectory')}
                >
                  Browse
                </Button>
              </div>
              <div className='text-xs text-slate-400'>
                For osu! stable, this is where osu! is installed (the folder containing osu!.exe). For osu!lazer, this
                is the osu!lazer data folder (the folder containing client.realm). You can find it in osu!lazer under
                Settings → General → Open osu! folder.
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
                osu!Collector will download .osz files to this location by default. When downloaded here, osu! stable
                will automatically detect and import all downloaded .osz files.
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
              <div className='text-xs text-slate-400'>
                You can use this to download .osz files to a different location. For osu!lazer, downloaded .osz files
                are imported into the game automatically.
              </div>
            </div>
          </>
        )}

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

        {/* <label */}
        {/*   htmlFor='desktop-notifications-checkbox' */}
        {/*   className={cn( */}
        {/*     'flex flex-col gap-1 self-start p-2 rounded', */}
        {/*     'transition-colors cursor-pointer hover:bg-slate-700', */}
        {/*   )} */}
        {/* > */}
        {/*   <div className='flex items-center gap-2'> */}
        {/*     <Checkbox */}
        {/*       id='desktop-notifications-checkbox' */}
        {/*       checked={preferences?.notifyOnDownloadsComplete ?? false} */}
        {/*       onCheckedChange={(checked) => setPreference('notifyOnDownloadsComplete', checked as boolean)} */}
        {/*     /> */}
        {/*     <span className='text-sm text-white'>desktop notifications</span> */}
        {/*   </div> */}
        {/*   <div className='text-xs text-slate-400'> */}
        {/*     When a collection has been completely downloaded, a desktop notification will be shown. */}
        {/*   </div> */}
        {/* </label> */}
      </div>
    </main>
  );
}

type PathPreference =
  | 'osuInstallDirectory'
  | 'osuSongsDirectory'
  | 'downloadDirectoryOverride'
  | 'lazerExecutablePath'
  | 'lazerDataDirectory';

interface GameOptionProps {
  value: OsuClient;
  selected: boolean;
  children: ReactNode;
}
function GameOption({ value, selected, children }: GameOptionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded border p-3 transition-colors',
        selected ? 'border-slate-400 bg-slate-800' : 'border-white/10',
      )}
    >
      <label className='flex cursor-pointer items-center gap-2'>
        <RadioGroupItem value={value} />
        <span className='text-sm text-white'>{osuClientNames[value]}</span>
      </label>
      <div className='pl-6'>{children}</div>
    </div>
  );
}
