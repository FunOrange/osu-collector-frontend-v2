export enum Status {
  Pending = 'pending',
  CheckingLocalFiles = 'checking-local-files',
  AlreadyDownloaded = 'already-downloaded',
  AlreadyInstalled = 'already-installed',
  Queued = 'queued',
  Fetching = 'fetching', // get osz-dl
  Fetched = 'fetched',
  Downloading = 'downloading',
  Completed = 'completed',
  Failed = 'failed',
}

export enum Mirror {
  Beatconnect = 'beatconnect',
  OsuCollector = 'osu-collector',
}

interface DownloadBase<S extends Status> {
  status: S;
  beatmapsetId: number;
  downloadDirectory: string;
  cancelled: boolean;
}

interface DownloadExtended {
  [Status.AlreadyDownloaded]: {
    downloadPath: string;
  };
  [Status.AlreadyInstalled]: {
    installLocation: string;
  };
  [Status.Fetched]: {
    mirror: Mirror;
    remoteUrl: string;
    filename: string | undefined;
  };
  [Status.Downloading]: DownloadExtended[Status.Fetched] & {
    outputPath: string;
    size: {
      downloaded: number;
      total: number;
    };
    abort: () => void;
  };
  [Status.Completed]: Omit<DownloadExtended[Status.Downloading], 'abort'>;
  [Status.Failed]: Omit<DownloadExtended[Status.Downloading], 'abort'> & {
    error: Error;
  };
}

export interface DownloadType {
  [Status.Pending]: DownloadBase<Status.Pending>;
  [Status.CheckingLocalFiles]: DownloadBase<Status.CheckingLocalFiles>;
  [Status.AlreadyDownloaded]: DownloadBase<Status.AlreadyDownloaded> & DownloadExtended[Status.AlreadyDownloaded];
  [Status.AlreadyInstalled]: DownloadBase<Status.AlreadyInstalled> & DownloadExtended[Status.AlreadyInstalled];
  [Status.Queued]: DownloadBase<Status.Queued>;
  [Status.Fetching]: DownloadBase<Status.Fetching>;
  [Status.Fetched]: DownloadBase<Status.Fetched> & DownloadExtended[Status.Fetched];
  [Status.Downloading]: DownloadBase<Status.Downloading> & DownloadExtended[Status.Downloading];
  [Status.Completed]: DownloadBase<Status.Completed> & DownloadExtended[Status.Completed];
  [Status.Failed]: DownloadBase<Status.Failed> & DownloadExtended[Status.Failed];
}

export type Download = 
  | DownloadType[Status.Pending]
  | DownloadType[Status.CheckingLocalFiles]
  | DownloadType[Status.AlreadyDownloaded]
  | DownloadType[Status.AlreadyInstalled]
  | DownloadType[Status.Queued]
  | DownloadType[Status.Fetching]
  | DownloadType[Status.Fetched]
  | DownloadType[Status.Downloading]
  | DownloadType[Status.Completed]
  | DownloadType[Status.Failed];

