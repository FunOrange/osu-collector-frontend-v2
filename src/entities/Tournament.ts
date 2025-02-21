import { Beatmap } from '@/shared/entities/v1/Beatmap';
import { Uploader } from '@/shared/entities/v1/Uploader';
import { FirestoreTimestamp } from '@/types';

export interface Tournament {
  unknownIds: any[];
  link: string;
  downloadUrl: string;
  dateUploaded: FirestoreTimestamp;
  description: string;
  banner: string;
  dateModified: FirestoreTimestamp;
  organizerIds: number[];
  uploader: Uploader;
  name: string;
  organizers: Organizer[];
  id: number;
  rounds: Round[];
}

export interface Organizer {
  id: number;
  username: string;
}

export interface Round {
  mods: Mod[];
  round: string;
}

export interface Mod {
  mod: string;
  maps: Beatmap[];
}

export interface Beatmapset {
  creator: string;
  artist: string;
  id: number;
  title: string;
  covers: Covers;
}

export interface Covers {
  card: string;
}
