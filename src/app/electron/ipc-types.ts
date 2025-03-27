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
}

type IpcHandlersBase = {
  [C in Channel]: (...args: any[]) => any;
};
export interface IpcHandlers extends IpcHandlersBase {
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
}
