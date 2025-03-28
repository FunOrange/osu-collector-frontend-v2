import { Preferences } from "@/app/electron/preferences";
import { Download } from "./downloader-types";

export enum Channel {
  PathJoin = "pathJoin",
  PathSep = "pathSep",
  OpenDevTools = "openDevTools",
  GetDownloads = "getDownloads",
  AddDownload = "addDownload",
  CancelDownload = "cancelDownload",
  ClearDownloads = "clearDownloads",
  RetryDownload = "retryDownload",
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
}

export interface IpcHandlers {
  [Channel.PathJoin]: (...args: string[]) => Promise<string>;
  [Channel.PathSep]: () => Promise<string>;
  [Channel.GetDownloads]: () => Promise<Download[]>;
  [Channel.AddDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.CancelDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.ClearDownloads]: () => Promise<void>;
  [Channel.RetryDownload]: (beatmapsetId: number) => Promise<void>;
  [Channel.RevealPath]: (path: string) => Promise<void>;
  [Channel.OpenLinkInBrowser]: (url: string) => Promise<void>;
  [Channel.GetPreferences]: () => Promise<Preferences>;
  [Channel.SetPreferences]: (preferences: Preferences) => Promise<void>;
  [Channel.OpenFolderDialog]: () => Promise<string | undefined>;
  [Channel.PathExists]: (path: string) => Promise<boolean>;
  [Channel.GetLogs]: () => Promise<{ path: string; lines: string[] }>;
  [Channel.GetURI]: () => Promise<string | undefined>;
  [Channel.ClearURI]: () => Promise<void>;
  [Channel.OnURI]: (callback: ((_: true) => any)) => void;
  [Channel.GetDownloadDirectory]: () => Promise<string | undefined>;
}
