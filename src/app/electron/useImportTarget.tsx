import { Channel } from '@/app/electron/ipc-types';
import { OsuClient } from '@/app/electron/preferences';
import { useOsuClients } from '@/app/electron/useOsuClients';
import { useOsuCollectionsFile } from '@/app/electron/useOsuCollectionsFile';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const osuClientNames: Record<OsuClient, string> = {
  stable: 'osu! stable',
  lazer: 'osu!lazer',
};

/**
 * Which game a collection/tournament is imported into. Defaults to the game chosen in settings,
 * and can be changed for a single import.
 */
export function useImportTarget(pathSep: string) {
  const { data: preferences } = useSWR(Channel.GetPreferences, () => window.ipc?.getPreferences());
  const { supported, info } = useOsuClients();
  // older app versions treat the osu! install folder as osu!lazer's if it contains client.realm
  const legacyCollectionsFile = useOsuCollectionsFile(
    supported ? undefined : preferences?.osuInstallDirectory,
    pathSep,
  );

  const [override, setOverride] = useState<OsuClient | undefined>();
  const resetClient = useCallback(() => setOverride(undefined), []);
  const defaultClient: OsuClient = supported
    ? (info?.osuClient ?? 'stable')
    : legacyCollectionsFile.isLazer
      ? 'lazer'
      : 'stable';
  const client = (supported && override) || defaultClient;

  const { data: downloadDirectory } = useSWR([Channel.GetDownloadDirectory, supported ? client : null], ([_, c]) =>
    window.ipc?.getDownloadDirectory(c ?? undefined),
  );
  const { data: downloadDirectoryExists } = useSWR([Channel.PathExists, downloadDirectory], ([_, path]) =>
    window.ipc?.pathExists(path),
  );
  const collectionDbPath = preferences?.osuInstallDirectory + pathSep + 'collection.db';
  const { data: collectionDbExists } = useSWR(
    supported && preferences?.osuInstallDirectory ? [Channel.PathExists, collectionDbPath] : null,
    ([_, path]) => window.ipc?.pathExists(path),
  );

  const lazer = info?.lazer;
  // maps are imported into osu!lazer automatically, rather than downloaded to a folder of the user's choosing
  const importsMapsIntoLazer = supported && client === 'lazer' && Boolean(lazer?.executableFound);

  const collectionsDisabledReason = ((): string | false => {
    if (!supported) {
      if (!preferences?.osuInstallDirectory) return 'Please set your osu! install folder in settings!';
      if (!legacyCollectionsFile.exists)
        return `File not found: ${legacyCollectionsFile.path}\nPlease fix your osu! install folder in settings!`;
      return false;
    }
    if (client === 'lazer') {
      if (!lazer?.found)
        return 'osu!lazer was not found. Please install osu!lazer, or launch it once so it can create its data folder.';
      return false;
    }
    if (!preferences?.osuInstallDirectory) return 'Please set your osu! stable install folder in settings!';
    if (!collectionDbExists)
      return `File not found: ${collectionDbPath}\nPlease fix your osu! stable install folder in settings!`;
    return false;
  })();

  const downloadsDisabledReason = ((): string | false => {
    if (importsMapsIntoLazer) return false;
    if (!downloadDirectory) return 'Please set your download folder in settings!';
    if (!downloadDirectoryExists)
      return `This folder does not exist: ${downloadDirectory} - please fix this in settings!`;
    return false;
  })();

  const collectionsFilename = supported
    ? client === 'lazer'
      ? 'osu!lazer collections'
      : 'collection.db'
    : legacyCollectionsFile.filename;

  return {
    supported,
    client,
    setClient: setOverride,
    resetClient,
    preferences,
    lazer,
    stableDirectory: preferences?.osuInstallDirectory,
    downloadDirectory,
    importsMapsIntoLazer,
    collectionsDisabledReason,
    downloadsDisabledReason,
    collectionsFilename,
    collectionsStepLabel:
      supported && client === 'lazer' ? 'add collection to osu!lazer' : `modify ${collectionsFilename} file`,
  };
}

export function ImportTargetSwitch({ target }: { target: ReturnType<typeof useImportTarget> }) {
  if (!target.supported) return null;
  return (
    <div className='flex items-center gap-2 text-sm'>
      <span className='text-slate-400'>Importing to:</span>
      <Tabs value={target.client} onValueChange={(value) => target.setClient(value as OsuClient)}>
        <TabsList className='gap-1 bg-slate-800 shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]'>
          <TabsTrigger value='stable'>{osuClientNames.stable}</TabsTrigger>
          <TabsTrigger value='lazer'>{osuClientNames.lazer}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
