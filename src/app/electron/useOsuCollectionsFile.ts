import { Channel } from '@/app/electron/ipc-types';
import useSWR from 'swr';

/**
 * osu! stable stores collections in collection.db, while osu!lazer stores them in client.realm.
 * The install folder is treated as an osu!lazer data folder if it contains client.realm.
 */
export function useOsuCollectionsFile(osuInstallDirectory: string | undefined, pathSep: string) {
  const realmPath = osuInstallDirectory + pathSep + 'client.realm';
  const { data: isLazer } = useSWR(osuInstallDirectory ? [Channel.PathExists, realmPath] : null, ([_, path]) =>
    window.ipc?.pathExists(path),
  );
  const filename = isLazer ? 'client.realm' : 'collection.db';
  const path = osuInstallDirectory + pathSep + filename;
  const { data: exists } = useSWR(osuInstallDirectory ? [Channel.PathExists, path] : null, ([_, path]) =>
    window.ipc?.pathExists(path),
  );
  return { isLazer: Boolean(isLazer), filename, path, exists };
}
