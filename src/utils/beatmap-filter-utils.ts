import { BeatmapWithBeatmapset } from '@/shared/entities/v2/Beatmap';
import { clone } from 'ramda';
import { match } from 'ts-pattern';

export interface BeatmapFilters {
  stars: [number, number];
  bpm: [number, number];
  status?: 'any' | 'ranked' | 'qualified' | 'loved' | 'pending' | 'graveyard' | null;
  search?: string;
}

export const filterBeatmaps = (beatmaps: BeatmapWithBeatmapset[] | undefined, filters: BeatmapFilters, excludedBeatmapsetIds?: number[]) => {
  if (!beatmaps) return [];

  const _filters = clone(filters);
  if (filters.stars[0] === 0) _filters.stars[0] = -Infinity;
  if (filters.stars[1] === 11) _filters.stars[1] = Infinity;
  if (filters.bpm[0] === 150) _filters.bpm[0] = -Infinity;
  if (filters.bpm[1] === 310) _filters.bpm[1] = Infinity;
  if (filters.search) _filters.search = filters.search.trim();

  const isWithinRange = ([min, max]: [number, number], value: number) => value >= min && value < max;

  const excludeBeatmapsetIds = (beatmap: BeatmapWithBeatmapset) =>
    !excludedBeatmapsetIds?.includes(beatmap.beatmapset_id);

  const byRankedStatus = (beatmap: BeatmapWithBeatmapset) =>
    match(filters.status)
      .with('any', () => true)
      .with('ranked', () => beatmap.status === 'ranked')
      .with('qualified', () => beatmap.status === 'qualified')
      .with('loved', () => beatmap.status === 'loved')
      .with('pending', () => beatmap.status === 'pending')
      .with('graveyard', () => beatmap.status === 'graveyard')
      .with(undefined, () => true)
      .with(null, () => true)
      .exhaustive();

  const withinStarRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.stars, beatmap.difficulty_rating);
  const withinBpmRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.bpm, beatmap.bpm);

  const matchesKeyword = (beatmap: BeatmapWithBeatmapset) => {
    if (!_filters.search) return true;
    const caseInsensitiveMatch = (field: string) => field.toLowerCase().includes(_filters.search!.toLowerCase());
    if (caseInsensitiveMatch(beatmap.beatmapset?.title)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.artist)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.creator)) return true;
    if (caseInsensitiveMatch(beatmap.version)) return true;
    return false;
  };

  return beatmaps
    .filter(excludeBeatmapsetIds)
    .filter(withinStarRange)
    .filter(withinBpmRange)
    .filter(matchesKeyword)
    .filter(byRankedStatus);
};
