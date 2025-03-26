import { Download } from "./downloader-types";

export enum Channel {
  PathJoin = "pathJoin",
  PathSep = "pathSep",
  OpenDevTools = "openDevTools",
  GetDownloads = "getDownloads",
  AddDownload = "addDownload",
  CancelDownload = "cancelDownload",
  ClearDownloads = "clearDownloads",
}

type IpcHandlersBase = {
  [C in Channel]: (...args: any[]) => any;
};
export interface IpcHandlers extends IpcHandlersBase {
  [Channel.PathJoin]: (...args: string[]) => string;
  [Channel.PathSep]: () => string;
  [Channel.GetDownloads]: () => Download[];
  [Channel.AddDownload]: (beatmapsetId: number) => void;
  [Channel.CancelDownload]: (beatmapsetId: number) => void;
  [Channel.ClearDownloads]: () => void;
}
