import { Preferences } from '@/app/electron/preferences';
import { Download, DownloadMetadata } from './downloader-types';
import { TournamentImportMethod } from '@/app/electron/ElectronImportTournamentDialog';

export enum Channel {
  GetAppVersion = 'getAppVersion',
  PathJoin = 'pathJoin',
  PathSep = 'pathSep',
  OpenDevTools = 'openDevTools',
  GetDownloads = 'getDownloads',
  OnDownloadUpdate = 'onDownloadUpdate',
  AddDownloads = 'addDownloads',
  CancelDownload = 'cancelDownload',
  ClearDownload = 'clearDownload',
  ClearCancelledDownloads = 'clearCancelledDownloads',
  ClearInactiveDownloads = 'clearInactiveDownloads',
  ClearFailedDownloads = 'clearFailedDownloads',
  ClearCompletedDownloads = 'clearCompletedDownloads',
  StopAllDownloads = 'stopAllDownloads',
  RetryDownload = 'retryDownload',
  RevealPath = 'revealPath',
  OpenLinkInBrowser = 'openLinkInBrowser',
  GetPreferences = 'getPreferences',
  SetPreferences = 'setPreferences',
  OpenFolderDialog = 'openFolderDialog',
  PathExists = 'pathExists',
  GetLogs = 'getLogs',
  GetURI = 'getURI',
  ClearURI = 'clearURI',
  OnURI = 'onURI',
  GetDownloadDirectory = 'getDownloadDirectory',
  CheckIfOsuIsRunning = 'checkIfOsuIsRunning',
  MergeCollectionDb = 'mergeCollectionDb',
}

export interface IpcHandlers {
  [Channel.GetAppVersion]: () => Promise<string>;
  [Channel.PathJoin]: (...args: string[]) => Promise<string>;
  [Channel.PathSep]: () => Promise<string>;
  [Channel.OpenDevTools]: () => Promise<void>;
  [Channel.GetDownloads]: () => Promise<Download[]>;
  [Channel.OnDownloadUpdate]: (beatmapsetId: number, callback: (download: Download) => any) => void;
  [Channel.AddDownloads]: (options: { beatmapsetIds: number[]; metadata: DownloadMetadata }) => Promise<void>;
  [Channel.CancelDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.ClearDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.ClearCancelledDownloads]: () => Promise<void>;
  [Channel.ClearInactiveDownloads]: () => Promise<void>;
  [Channel.ClearFailedDownloads]: () => Promise<void>;
  [Channel.ClearCompletedDownloads]: () => Promise<void>;
  [Channel.StopAllDownloads]: () => Promise<void>;
  [Channel.RetryDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.RevealPath]: (path: string) => Promise<void>;
  [Channel.OpenLinkInBrowser]: (url: string) => Promise<void>;
  [Channel.GetPreferences]: () => Promise<Preferences>;
  [Channel.SetPreferences]: (preferences: Preferences) => Promise<void>;
  [Channel.OpenFolderDialog]: () => Promise<string | undefined>;
  [Channel.PathExists]: (path: string | undefined) => Promise<boolean>;
  [Channel.GetLogs]: () => Promise<{ path: string; lines: string[] }>;
  [Channel.GetURI]: () => Promise<string | undefined>;
  [Channel.ClearURI]: () => Promise<void>;
  [Channel.OnURI]: (callback: (_: true) => any) => void;
  [Channel.GetDownloadDirectory]: () => Promise<string | undefined>;
  [Channel.CheckIfOsuIsRunning]: () => Promise<boolean>;
  [Channel.MergeCollectionDb]: (
    options: { collectionId: number } | { tournamentId: number; groupBy: TournamentImportMethod },
  ) => Promise<void>;
}
