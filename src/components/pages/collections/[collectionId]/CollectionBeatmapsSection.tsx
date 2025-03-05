'use client';
import { clone } from 'ramda';
import CollectionBeatmapFilters, {
  BeatmapFilters,
} from '@/components/pages/collections/[collectionId]/CollectionBeatmapsSection/CollectionBeatmapFilters';
import { Collection } from '@/shared/entities/v1/Collection';
import useSWR from 'swr';
import { endpoints } from '@/shared/endpoints';
import { groupBeatmapsets } from '@/shared/entities/v1/Beatmap';
import axios from 'axios';
import BeatmapsetListing from '@/components/pages/collections/[collectionId]/BeatmapsetListing';
import { useState } from 'react';
import { Beatmap, BeatmapWithBeatmapset } from '@/shared/entities/v2/Beatmap';
import { Beatmapset } from '@/shared/entities/v2/Beatmapset';

const perPage = 50;

export interface CollectionBeatmapsSectionProps {
  collection: Collection;
}

export default function CollectionBeatmapsSection({ collection }: CollectionBeatmapsSectionProps) {
  const v2 = useSWR(endpoints.collections.id(collection.id).beatmapsv2.GET, (url) =>
    axios.get(url, { params: { perPage } }).then((res) => res.data),
  );

  // #region frontend filtering and sorting
  const [filters, _setFilters] = useState<BeatmapFilters>({
    search: '',
    stars: [0, 11],
    bpm: [150, 310],
  });
  const [frontendFilteringEnabled, setFrontendFilteringEnabled] = useState(false);
  const setFilters = (...args: Parameters<typeof _setFilters>): ReturnType<typeof _setFilters> => {
    setFrontendFilteringEnabled(true);
    setPage(1);
    return _setFilters(...args);
  };
  const v3 = useSWR(frontendFilteringEnabled && endpoints.collections.id(collection.id).beatmapsv3.GET, (url) =>
    axios.get<{ beatmaps: Beatmap[]; beatmapsets: Beatmapset[] }>(url, { params: { perPage } }).then((res) => res.data),
  );
  const [page, setPage] = useState(1);
  // #endregion frontend filtering and sorting

  // consolidate displaying backend vs frontend data
  const isLoading = v2.isLoading || v3.isLoading;
  const hasMore = frontendFilteringEnabled
    ? filterSortPaginate(joinBeatmapsets(v3.data?.beatmaps, v3.data?.beatmapsets), {
        filters,
        sort: undefined,
        page: 1,
        perPage: v3.data?.beatmaps?.length,
      })?.length >
      perPage * (page + 1)
    : v2.data?.hasMore;
  const beatmaps =
    filterSortPaginate(joinBeatmapsets(v3.data?.beatmaps, v3.data?.beatmapsets), {
      filters,
      sort: undefined,
      page,
      perPage,
    }) ?? v2.data?.beatmaps;
  const listing = groupBeatmapsets(beatmaps);

  return (
    <div className='flex flex-col'>
      <CollectionBeatmapFilters collection={collection} filters={filters} setFilters={setFilters} />

      <div className='min-h-screen sm:p-4 sm:pt-0 rounded-b border-slate-900 shadow-inner bg-[#162032]'>
        <BeatmapsetListing listing={listing ?? []} isLoading={isLoading} />
        {!isLoading && hasMore && (
          <div
            className='mt-4 cursor-pointer w-full p-3 text-center transition rounded bg-slate-800 hover:shadow-xl hover:bg-slate-600'
            onClick={() => {
              setFrontendFilteringEnabled(true);
              setPage(page + 1);
            }}
          >
            Load more
          </div>
        )}
      </div>
    </div>
  );
}

const joinBeatmapsets = (beatmaps: Beatmap[], beatmapsets: Beatmapset[]): BeatmapWithBeatmapset[] =>
  beatmaps?.map((beatmap) => ({ ...beatmap, beatmapset: beatmapsets?.find((b) => b.id === beatmap.beatmapset_id) }));

function filterSortPaginate(
  beatmaps: BeatmapWithBeatmapset[],
  { filters, sort, page, perPage }: { filters: BeatmapFilters; sort: string; page: number; perPage: number },
) {
  const _filters = clone(filters);
  if (filters.stars[0] === 0) _filters.stars[0] = -Infinity;
  if (filters.stars[1] === 11) _filters.stars[1] = Infinity;
  if (filters.bpm[0] === 150) _filters.bpm[0] = -Infinity;
  if (filters.bpm[1] === 310) _filters.bpm[1] = Infinity;
  _filters.search = filters.search.trim();

  const isWithinRange = ([min, max]: [number, number], value: number) => value >= min && value <= max;
  const withinStarRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.stars, beatmap.difficulty_rating);
  const withinBpmRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.bpm, beatmap.bpm);
  const matchesSearch = (beatmap: BeatmapWithBeatmapset) => {
    if (!_filters.search) return true;
    const caseInsensitiveMatch = (field: string) => field.toLowerCase().includes(_filters.search.toLowerCase());
    if (caseInsensitiveMatch(beatmap.beatmapset?.title)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.artist)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.creator)) return true;
    if (caseInsensitiveMatch(beatmap.version)) return true;
  };
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return beatmaps
    ?.filter(withinStarRange)
    ?.filter(withinBpmRange)
    ?.filter(matchesSearch)
    ?.sort((a, b) => {
      if (a.beatmapset?.title !== b.beatmapset?.title) return a.beatmapset?.title.localeCompare(b.beatmapset?.title);
      if (a.beatmapset?.id !== b.beatmapset?.id) return b.beatmapset?.id - a.beatmapset?.id;
      return b.difficulty_rating - a.difficulty_rating;
    })
    ?.slice(start, end);
}
