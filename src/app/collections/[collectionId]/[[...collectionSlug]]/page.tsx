import moment from 'moment';
import ModeCounters from '@/components/ModeCounters';
import * as api from '@/services/osu-collector-api';
import Link from 'next/link';
import Image from 'next/image';
import { formatQueryParams, getUrlSlug } from '@/utils/string-utils';
import { identity, mergeRight } from 'ramda';
import { Pattern, match } from 'ts-pattern';
import { groupBeatmapsets } from '@/entities/Beatmap';
import { cn } from '@/utils/shadcn-utils';
import FavouriteButton from '@/components/FavouriteButton';
import BarGraphStars from '@/components/pages/collections/[collectionId]/BarGraphStars';
import BarGraphBpm from '@/components/pages/collections/[collectionId]/BarGraphBpm';
import DownloadMapsButton from '@/components/pages/collections/[collectionId]/DownloadMapsButton';
import AddToOsuButton from '@/components/pages/collections/[collectionId]/AddToOsuButton';
import BeatmapsetListing from '@/components/pages/collections/[collectionId]/BeatmapsetListing';
import CollectionCommentsSection from '@/components/pages/collections/[collectionId]/CollectionCommentsSection';
import EditableCollectionName from '@/components/pages/collections/[collectionId]/EditableCollectionName';
import CollectionDeleteButton from '@/components/pages/collections/[collectionId]/CollectionDeleteButton';
import EditableCollectionDescription from '@/components/pages/collections/[collectionId]/EditableCollectionDescription';
import CollectionUpdateButton from '@/components/pages/collections/[collectionId]/CollectionUpdateButton';

interface CollectionPageProps {
  params: { collectionId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const collection = await api.getCollection(params.collectionId);

  const graphHeight = 160;

  const searchParamsSortBy = match(searchParams.sortBy)
    .with('beatmapset.artist', identity)
    .with('beatmapset.title', identity)
    .with('beatmapset.creator', identity)
    .with('difficulty_rating', identity)
    .with('bpm', identity)
    .with('hit_length', identity)
    .otherwise(() => undefined);
  const searchParamsOrderBy = match(searchParams.orderBy)
    .with('asc', identity)
    .with('desc', identity)
    .otherwise(() => undefined);
  const { orderBy, sortBy } = match({ searchParamsSortBy, searchParamsOrderBy })
    .with({ searchParamsSortBy: Pattern.string, searchParamsOrderBy: Pattern.string }, () => ({
      sortBy: searchParamsSortBy,
      orderBy: searchParamsOrderBy,
    }))
    .otherwise(() => ({
      sortBy: 'beatmapset.artist',
      orderBy: 'asc',
    }));
  const { beatmaps, hasMore, nextPageCursor } = await api.getCollectionBeatmaps({
    collectionId: collection.id,
    cursor: searchParams.cursor,
    orderBy,
    sortBy,
    filterMin: searchParams.filterMin,
    filterMax: searchParams.filterMax,
    perPage: 24,
  });
  const listing = groupBeatmapsets(beatmaps);

  const pathname = `/collections/${collection.id}/${getUrlSlug(collection.name)}`;

  const replaceQueryParams = (newParams: any) =>
    `${pathname}?${formatQueryParams(mergeRight(searchParams, newParams))}`;

  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col px-2 py-5 md:px-10 gap-7 max-w-screen-2xl'>
        <div className='rounded border-slate-900 shadow-inner bg-[#162032]'>
          <div className='grid mb-4 rounded-t lg:grid-cols-2 xs:grid-cols-1'>
            <BarGraphStars
              collection={collection}
              height={graphHeight}
              replaceQueryParams={replaceQueryParams}
              className='rounded-tl'
            />
            <div className='hidden sm:block'>
              <BarGraphBpm
                collection={collection}
                height={graphHeight}
                replaceQueryParams={replaceQueryParams}
                className='rounded-tr'
              />
            </div>
          </div>
          <div className='p-4'>
            <EditableCollectionName collection={collection} />
            <div className='grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <div className='mb-2'>
                  <ModeCounters collection={collection} showUnavailable />
                </div>
                <small className='text-slate-400'>
                  Uploaded {moment.unix(collection.dateUploaded._seconds).fromNow()}
                </small>
                <div className='grid items-start w-full gap-4 pt-4 pr-4' style={{ gridTemplateColumns: 'auto 1fr' }}>
                  <div className='flex items-center justify-start px-2 py-1 mt-1 transition rounded-lg cursor-pointer first-letter:items-center hover:bg-slate-900'>
                    <Image
                      className='mr-2 rounded-full'
                      src={`https://a.ppy.sh/${collection.uploader.id}`}
                      width={32}
                      height={32}
                      alt={'Collection uploader avatar'}
                    />
                    <div className='flex flex-col'>
                      <div className='text-sm whitespace-nowrap'>{collection.uploader.username}</div>
                      {collection.uploader.rank > 0 && (
                        <small className='text-xs text-slate-500'>#{collection.uploader.rank}</small>
                      )}
                    </div>
                  </div>
                  <EditableCollectionDescription collection={collection} />
                </div>
              </div>
              <div className='flex flex-col justify-end gap-2'>
                <CollectionDeleteButton collection={collection} />
                <DownloadMapsButton collection={collection} />
                <AddToOsuButton collection={collection} />
                <FavouriteButton collection={collection} variant='fullWidth' />
                <CollectionUpdateButton collection={collection} />
              </div>
            </div>
          </div>
        </div>

        <CollectionCommentsSection collection={collection} />

        <div className='flex flex-col gap-6 p-4 rounded border-slate-900 shadow-inner bg-[#162032]'>
          <div className='flex items-center gap-6'>
            <div>Sort by:</div>
            <div className='flex gap-2'>
              {[
                {
                  labelDefault: 'Artist',
                  labelAsc: 'Artist: A-Z',
                  labelDesc: 'Artist: Z-A',
                  sortKey: 'beatmapset.artist',
                  defaultOrderBy: 'asc',
                },
                {
                  labelDefault: 'Title',
                  labelAsc: 'Title: A-Z',
                  labelDesc: 'Title: Z-A',
                  sortKey: 'beatmapset.title',
                  defaultOrderBy: 'asc',
                },
                {
                  labelDefault: 'Mapper',
                  labelAsc: 'Mapper: A-Z',
                  labelDesc: 'Mapper: Z-A',
                  sortKey: 'beatmapset.creator',
                  defaultOrderBy: 'asc',
                },
                {
                  labelDefault: 'Stars',
                  labelAsc: 'Stars: lowest',
                  labelDesc: 'Stars: highest',
                  sortKey: 'difficulty_rating',
                  defaultOrderBy: 'desc',
                },
                {
                  labelDefault: 'BPM',
                  labelAsc: 'BPM: lowest',
                  labelDesc: 'BPM: highest',
                  sortKey: 'bpm',
                  defaultOrderBy: 'desc',
                },
                {
                  labelDefault: 'Length',
                  labelAsc: 'Length: shortest',
                  labelDesc: 'Length: longest',
                  sortKey: 'hit_length',
                  defaultOrderBy: 'desc',
                },
              ]
                .filter(Boolean)
                .map(({ labelDefault, labelAsc, labelDesc, sortKey, defaultOrderBy }, i) =>
                  match({ sortBy, orderBy })
                    .with({ sortBy: sortKey, orderBy: 'asc' }, () => (
                      <Link
                        key={i}
                        replace
                        href={replaceQueryParams({
                          sortBy: sortKey,
                          orderBy: 'desc',
                          cursor: undefined,
                        })}
                        className={cn(
                          'px-3 py-1 flex items-center gap-2 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-600',
                          'text-indigo-200 bg-indigo-800 hover:bg-indigo-700 opacity-90  border-indigo-800 hover:border-indigo-700',
                        )}
                      >
                        {labelAsc ?? labelDefault}
                      </Link>
                    ))
                    .with({ sortBy: sortKey, orderBy: 'desc' }, () => (
                      <Link
                        key={i}
                        replace
                        href={replaceQueryParams({
                          sortBy: sortKey,
                          orderBy: 'asc',
                          cursor: undefined,
                        })}
                        className={cn(
                          'px-3 py-1 flex items-center gap-2 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-600',
                          'text-indigo-200 bg-indigo-800 hover:bg-indigo-700 opacity-90  border-indigo-800 hover:border-indigo-700',
                        )}
                      >
                        {labelDesc ?? labelDefault}
                      </Link>
                    ))
                    .otherwise(() => (
                      <Link
                        replace
                        href={replaceQueryParams({
                          sortBy: sortKey,
                          orderBy: defaultOrderBy,
                          cursor: undefined,
                        })}
                        className={
                          'px-3 py-1 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-600'
                        }
                      >
                        {labelDefault}
                      </Link>
                    )),
                )}
            </div>
          </div>
          <div className='flex flex-col gap-4'>
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
          </div>
        </div>
      </div>
    </div>
  );
}
