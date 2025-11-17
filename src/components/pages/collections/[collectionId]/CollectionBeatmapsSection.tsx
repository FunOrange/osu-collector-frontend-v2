'use client';
import { clone, equals } from 'ramda';
import CollectionBeatmapFilters, {
  BeatmapFilters,
} from '@/components/pages/collections/[collectionId]/CollectionBeatmapsSection/CollectionBeatmapFilters';
import { Collection } from '@/shared/entities/v1/Collection';
import useSWR from 'swr';
import { endpoints } from '@/shared/endpoints';
import { groupBeatmapsets } from '@/shared/entities/v1/Beatmap';
import axios from 'axios';
import BeatmapsetListing from '@/components/pages/collections/[collectionId]/BeatmapsetListing';
import { useRef, useState } from 'react';
import { Beatmap, BeatmapWithBeatmapset } from '@/shared/entities/v2/Beatmap';
import { Beatmapset } from '@/shared/entities/v2/Beatmapset';
import { PaginationProps } from '@/components/shadcn/pagination';
import { navbarHeightPx } from '@/components/Navbar';
import { match } from 'ts-pattern';

const perPage = 50;

export interface CollectionBeatmapsSectionProps {
  collection: Collection;
}

export default function CollectionBeatmapsSection({ collection }: CollectionBeatmapsSectionProps) {
  const filtersRef = useRef<HTMLDivElement>(null);
  const listingRef = useRef<HTMLDivElement>(null);

  const scrollTo = (divRef: React.RefObject<HTMLDivElement>, offset = 0) => {
    const root = document.getElementById('app-root')!;
    root.scrollTo({ top: divRef.current?.offsetTop! - navbarHeightPx + offset, behavior: 'smooth' });
  };

  const v2 = useSWR(endpoints.collections.id(collection.id).beatmapsv2.GET, (url) =>
    axios.get(url, { params: { perPage } }).then((res) => res.data),
  );

  // #region frontend filtering and sorting
  const defaultFilters: BeatmapFilters = {
    search: '',
    stars: [0, 11],
    bpm: [150, 310],
    status: 'any',
  };
  const [filters, setFilters] = useState<BeatmapFilters>(defaultFilters);
  const [frontendFilteringEnabled, setFrontendFilteringEnabled] = useState(false);
  const applyFilters = (arg: ((prev: BeatmapFilters) => BeatmapFilters) | BeatmapFilters) => {
    const updateSearchParams = () => {
      const newFilters = typeof arg === 'function' ? arg(filters) : arg;
      const qs = new URLSearchParams(Object.entries(newFilters));
      const url = new URL(window.location.href);
      url.search = equals(newFilters, defaultFilters) ? '' : qs.toString();
      window.history.replaceState(null, '', url);
    };
    updateSearchParams();
    scrollTo(filtersRef);
    setFrontendFilteringEnabled(true);
    setPage(1);
    return setFilters(arg);
  };
  const v3 = useSWR(frontendFilteringEnabled && endpoints.collections.id(collection.id).beatmapsv3.GET, (url) =>
    axios.get<{ beatmaps: Beatmap[]; beatmapsets: Beatmapset[] }>(url, { params: { perPage } }).then((res) => res.data),
  );
  const [page, setPage] = useState(1);
  const frontendResults = frontendFilterSortPaginate(joinBeatmapsets(v3.data?.beatmaps, v3.data?.beatmapsets), {
    filters,
    sort: undefined,
    page,
    perPage,
  });
  // #endregion frontend filtering and sorting

  // consolidate displaying backend vs frontend data
  const isLoading = v2.isLoading || v3.isLoading;
  const hasMore = frontendFilteringEnabled ? frontendResults.pagination.total > perPage * (page + 1) : v2.data?.hasMore;
  const beatmaps = frontendResults.beatmaps ?? v2.data?.beatmaps;
  const listing = groupBeatmapsets(beatmaps);

  return (
    <div ref={filtersRef} className='flex flex-col mb-16'>
      <CollectionBeatmapFilters
        collection={collection}
        filters={filters}
        setFilters={applyFilters}
        pagination={{
          total: frontendResults.pagination.total ?? null,
          page: frontendResults.pagination.page,
          perPage: frontendResults.pagination.perPage,
        }}
        setPage={(value) => {
          scrollTo(listingRef, -56);
          setPage(value);
        }}
      />

      <div
        ref={listingRef}
        className='min-h-screen sm:p-4 sm:pt-0 rounded-b border-slate-900 shadow-inner bg-[#162032]'
      >
        <BeatmapsetListing listing={listing ?? []} isLoading={isLoading} />
        {!frontendFilteringEnabled && hasMore && (
          <div
            className='mt-4 cursor-pointer w-full p-3 text-center transition rounded bg-slate-800 hover:shadow-xl hover:bg-slate-600'
            onClick={() => {
              scrollTo(listingRef, -56);
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

export const joinBeatmapsets = (
  beatmaps: Beatmap[] | undefined,
  beatmapsets: Beatmapset[] | undefined,
): BeatmapWithBeatmapset[] | undefined =>
  beatmaps?.map((beatmap) => ({ ...beatmap, beatmapset: beatmapsets?.find((b) => b.id === beatmap.beatmapset_id)! }));

function frontendFilterSortPaginate(
  beatmaps: BeatmapWithBeatmapset[] | undefined,
  {
    filters,
    sort,
    page,
    perPage,
  }: { filters: BeatmapFilters; sort: string | undefined; page: number; perPage: number },
): { beatmaps: BeatmapWithBeatmapset[] | undefined; pagination: PaginationProps } {
  const _filters = clone(filters);
  if (filters.stars[0] === 0) _filters.stars[0] = -Infinity;
  if (filters.stars[1] === 11) _filters.stars[1] = Infinity;
  if (filters.bpm[0] === 150) _filters.bpm[0] = -Infinity;
  if (filters.bpm[1] === 310) _filters.bpm[1] = Infinity;
  _filters.search = filters.search.trim();

  const isWithinRange = ([min, max]: [number, number], value: number) => value >= min && value < max;
  const byRankedStatus = (beatmap: BeatmapWithBeatmapset) =>
    match(filters.status)
      .with('any', () => true)
      .with('ranked', () => beatmap.status === 'ranked')
      .with('qualified', () => beatmap.status === 'qualified')
      .with('loved', () => beatmap.status === 'loved')
      .with('pending', () => beatmap.status === 'pending')
      .with('graveyard', () => beatmap.status === 'graveyard')
      .exhaustive();
  const withinStarRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.stars, beatmap.difficulty_rating);
  const withinBpmRange = (beatmap: BeatmapWithBeatmapset) => isWithinRange(_filters.bpm, beatmap.bpm);
  const matchesKeyword = (beatmap: BeatmapWithBeatmapset) => {
    if (!_filters.search) return true;
    const caseInsensitiveMatch = (field: string) => field.toLowerCase().includes(_filters.search.toLowerCase());
    if (caseInsensitiveMatch(beatmap.beatmapset?.title)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.artist)) return true;
    if (caseInsensitiveMatch(beatmap.beatmapset?.creator)) return true;
    if (caseInsensitiveMatch(beatmap.version)) return true;
  };
  const start = (page - 1) * perPage;
  const end = start + perPage;

  const results = beatmaps
    ?.filter(withinStarRange)
    ?.filter(withinBpmRange)
    ?.filter(matchesKeyword)
    ?.filter(byRankedStatus)
    ?.sort((a, b) => {
      if (a.beatmapset?.title !== b.beatmapset?.title) return a.beatmapset?.title.localeCompare(b.beatmapset?.title);
      if (a.beatmapset?.id !== b.beatmapset?.id) return b.beatmapset?.id - a.beatmapset?.id;
      return b.difficulty_rating - a.difficulty_rating;
    });

  return {
    beatmaps: results?.slice(start, end),
    pagination: {
      total: results?.length ?? 0,
      page,
      perPage,
    },
  };
}
