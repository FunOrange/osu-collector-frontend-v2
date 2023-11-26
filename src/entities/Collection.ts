import { FirestoreDate } from "@/types";

export interface Collection {
  dateUploaded: FirestoreDate;
  uploader: Uploader;
  name: string;
  id: number;
  beatmapCount: number;
  dateLastModified: FirestoreDate;
  unsubmittedBeatmapCount: number;
  unknownChecksums: any[];
  beatmapsets: {
    beatmaps: {
      checksum: string;
      id: number;
    }[];
    id: number;
  }[];
  mappers: Record<string, number>;
  modes: Modes;
  difficultySpread: DifficultySpread;
  bpmSpread: BpmSpread;
  description: string;
  favouritedBy: number[];
  favourites: number;
  comments: Comment[];
}

interface Uploader {
  avatarURL: string;
  id: number;
  username: string;
}

interface Modes {
  osu: number;
  taiko: number;
  fruits: number;
  mania: number;
}

interface DifficultySpread {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
}

interface BpmSpread {
  150: number;
  160: number;
  170: number;
  180: number;
  190: number;
  200: number;
  210: number;
  220: number;
  230: number;
  240: number;
  250: number;
  260: number;
  270: number;
  280: number;
  290: number;
  300: number;
}

interface Comment {
  date: Date;
  upvotes: number[];
  id: string;
  message: string;
  userId: number;
  username: string;
}

interface Date {
  _seconds: number;
  _nanoseconds: number;
}
