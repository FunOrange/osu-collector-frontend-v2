import { Uploader } from '@/entities/Uploader';
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
  maps: Map[];
}

export interface Map {
  difficulty_rating: number;
  accuracy: number;
  version: string;
  url: string;
  cs: number;
  mode: string;
  ar: number;
  beatmapset: Beatmapset;
  checksum: string;
  id: number;
  hit_length: number;
  bpm: number;
  status: string;
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
