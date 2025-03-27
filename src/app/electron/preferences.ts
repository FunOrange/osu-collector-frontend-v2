export interface Preferences {
  osuInstallDirectory?: string;
  osuSongsDirectory?: string; // if undefined, use {osuInstallDirectory}/Songs
  downloadDirectoryOverride?: string; // if undefined, use {osuInstallDirectory}/Songs
  importedCollectionNameFormat?: string;
  minimizeToTray?: boolean;
  notifyOnDownloadsComplete?: boolean;
}
