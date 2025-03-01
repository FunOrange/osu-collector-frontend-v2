'use server';
import BeatmapsetListing from '@/components/pages/collections/[collectionId]/BeatmapsetListing';
import * as api from '@/services/osu-collector-api';
import { groupBeatmapsets } from '@/shared/entities/v1';
import { Collection } from '@/shared/entities/v1/Collection';
import { formatQueryParams, getUrlSlug } from '@/utils/string-utils';
import Link from 'next/link';
import { mergeRight } from 'ramda';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
  collection: Collection;
  orderBy: string;
  sortBy: string;
  cursor: string | string[];
  filterMin: string | string[];
  filterMax: string | string[];
}
export default async function BeatmapsetListingSC({
  searchParams,
  collection,
  orderBy,
  sortBy,
  cursor,
  filterMin,
  filterMax,
}: Props) {
  const { beatmaps, hasMore, nextPageCursor } = await api.getCollectionBeatmaps({
    collectionId: collection.id,
    cursor,
    orderBy,
    sortBy,
    filterMin,
    filterMax,
    perPage: 50,
  });
  const listing = groupBeatmapsets(beatmaps);
  const pathname = `/collections/${collection.id}/${getUrlSlug(collection.name)}`;
  const replaceQueryParams = (newParams: any) =>
    `${pathname}?${formatQueryParams(mergeRight(searchParams, newParams))}`;
  return (
    <>
      <BeatmapsetListing listing={listing} />
      {hasMore ? (
        <Link href={replaceQueryParams({ cursor: nextPageCursor })}>
          <div className='w-full p-3 text-center transition rounded bg-slate-800 hover:shadow-xl hover:bg-slate-600'>
            Load more
          </div>
        </Link>
      ) : (
        <div className='text-center text-slate-400'>Reached end of results</div>
      )}
    </>
  );
}
