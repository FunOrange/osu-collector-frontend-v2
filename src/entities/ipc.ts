export enum Channel {
  ApplyPreferences = 'apply-preferences',
  OpenFolderDialog = 'open-folder-dialog',
  RemoveImportedTournament = 'remove-imported-tournament',
  PathJoin = 'path-join',
  PathSep = 'path-sep',
  ImportTournament = 'import-tournament',
  ImportCollection = 'import-collection',
  CheckOsuRunning = 'check-osu-running',
  ClearDownload = 'clear-download',
  SkipCurrentDownload = 'skip-current-download',
  CancelDownload = 'cancel-download',
  StartTournamentDownload = 'start-tournament-download',
  StartDownload = 'start-download',
  ParseCollectionDb = 'parse-collection-db',
  ShowLogs = 'show-logs',
  OpenDevTools = 'open-dev-tools',
}

export interface IpcResponseMap {
  [Channel.ApplyPreferences]: void;
  [Channel.OpenFolderDialog]: {
    canceled: boolean;
    filePaths: string[];
    bookmarks?: string[];
  };
  [Channel.RemoveImportedTournament]: { error: string } | {};
  [Channel.PathJoin]: string;
  [Channel.PathSep]: string;
  [Channel.ImportTournament]: { error: string } | { missingBeatmapsets: number; existingBeatmapsets: number };
  [Channel.ImportCollection]: { error: string } | { missingBeatmapsets: number; existingBeatmapsets: number };
  [Channel.CheckOsuRunning]: { error: string } | boolean;
  [Channel.ClearDownload]: void;
  [Channel.SkipCurrentDownload]: void;
  [Channel.CancelDownload]: void;
  [Channel.StartTournamentDownload]: string | void;
  [Channel.StartDownload]: string | void;
  [Channel.ParseCollectionDb]: { error: string } | { data: any };
  [Channel.ShowLogs]: void;
  [Channel.OpenDevTools]: void;
}
export type IpcResponse<C extends Channel> = IpcResponseMap[C];

export interface IpcRenderer {
  send(channel: Channel, data: any): void;
  on(channel: Channel, listener: (event: any, ...args: any[]) => void): void;
  removeListener(channel: Channel, listener: (event: any, ...args: any[]) => void): void;
  invoke<C extends Channel>(channel: C, data: any): Promise<IpcResponse<C>>;
}
