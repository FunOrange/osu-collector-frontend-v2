'use client';
import Link from 'next/link';
import { formatQueryParams } from '@/utils/string-utils';
import { identity, mergeRight } from 'ramda';
import { Pattern, match } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { usePathname } from 'next/navigation';
import CollectionBeatmapFilters from '@/components/pages/collections/[collectionId]/CollectionBeatmapsSection/CollectionBeatmapFilters';
import { Collection } from '@/shared/entities/v1/Collection';
import useSWR from 'swr';
import { endpoint } from '@/shared/endpoints';
import { groupBeatmapsets } from '@/shared/entities/v1/Beatmap';
import axios from 'axios';
import BeatmapsetListing from '@/components/pages/collections/[collectionId]/BeatmapsetListing';
import { useRef } from 'react';
import useSticky from '@/hooks/useSticky';

export interface CollectionBeatmapsSectionProps {
  searchParams: { [key: string]: string | string[] | undefined };
  collection: Collection;
}

export default function CollectionBeatmapsSection({ searchParams, collection }: CollectionBeatmapsSectionProps) {
  const pathname = usePathname();
  const replaceQueryParams = (newParams: any) =>
    `${pathname}?${formatQueryParams(mergeRight(searchParams, newParams))}`;

  const params = { perPage: 50 };
  const { data, isLoading } = useSWR(endpoint.collections.id(collection.id).beatmapsv2.GET, (url) =>
    axios.get(url, { params }).then((res) => res.data),
  );
  const beatmaps = data?.beatmaps;
  const hasMore = data?.hasMore;
  const nextPageCursor = data?.nextPageCursor;
  const listing = groupBeatmapsets(beatmaps);

  return (
    <>
      <CollectionBeatmapFilters collection={collection} />

      <div className='flex flex-col gap-6 sm:p-4 rounded border-slate-900 shadow-inner bg-[#162032]'>
        <div className='flex flex-col gap-4 min-h-screen'>
          {!isLoading && (
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
          )}
        </div>
      </div>
    </>
  );
}
