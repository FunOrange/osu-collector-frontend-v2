import { Beatmapset } from '@/entities/Beatmapset';

export interface Beatmap {
  difficulty_rating: number;
  count_sliders: number;
  mode_int: number;
  accuracy: number;
  convert: boolean;
  failtimes: Failtimes;
  passcount: number;
  drain: number;
  mode: 'osu' | 'taiko' | 'mania' | 'fruits';
  is_scoreable: boolean;
  playcount: number;
  max_combo: number;
  checksum: string;
  ranked: number;
  total_length: number;
  id: number;
  bpm: number;
  beatmapset_id: number;
  last_updated: string;
  count_spinners: number;
  version: string;
  deleted_at: any;
  url: string;
  count_circles: number;
  cs: number;
  beatmapset: Beatmapset;
  ar: number;
  user_id: number;
  hit_length: number;
  status: string;
}

interface Failtimes {
  fail: number[];
  exit: number[];
}

export const groupBeatmapsets = (beatmaps: Beatmap[]) => {
  if (beatmaps?.length === 0) {
    return [];
  }
  let groups = [];
  let currentGroup = null;
  for (const beatmap of beatmaps) {
    if (currentGroup === null) {
      currentGroup = {
        beatmapset: beatmap.beatmapset,
        beatmaps: [beatmap],
      };
    } else if (beatmap.beatmapset.id === currentGroup.beatmapset.id) {
      currentGroup.beatmaps.push(beatmap);
    } else {
      currentGroup.beatmaps.sort((a, b) => b.difficulty_rating - a.difficulty_rating);
      groups.push(currentGroup);
      currentGroup = {
        beatmapset: beatmap.beatmapset,
        beatmaps: [beatmap],
      };
    }
  }
  groups.push(currentGroup);
  return groups;
};
