export type OsuClient = 'stable' | 'lazer';

export interface Preferences {
  osuClient?: OsuClient; // undefined until the user has picked which game they play
  osuInstallDirectory?: string; // osu! stable install folder
  osuSongsDirectory?: string; // if undefined, use {osuInstallDirectory}/Songs
  downloadDirectoryOverride?: string; // if undefined, use {osuInstallDirectory}/Songs
  // osu!lazer's folders are detected automatically; these are for when detection fails
  lazerExecutablePath?: string;
  lazerDataDirectory?: string; // the folder containing client.realm
  lazerSuggestionDismissed?: boolean;
  importedCollectionNameFormat?: string;
  minimizeToTray?: boolean;
  notifyOnDownloadsComplete?: boolean;
}

/** Returned by newer versions of the osu!Collector app. Mirrors osu-clients-info.ts in the app. */
export interface OsuClientsInfo {
  osuClient: OsuClient; // the game chosen in settings, or a best guess if not chosen yet
  stable: {
    detectedDirectory?: string;
  };
  lazer: {
    found: boolean;
    dataDirectory?: string;
    executableFound: boolean;
    canDetectExecutable: boolean;
    canAddCollectionsWhileRunning: boolean;
    supportsDataDirectoryPreference?: true; // undefined on app versions without lazerDataDirectory
  };
  suggestSwitchToLazer: boolean;
}
