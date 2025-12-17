import CollectionCard from '@/components/CollectionCard';
import MoreResultsButton from '@/components/MoreResultsButton';
import * as api from '@/services/osu-collector-api';
import Link from 'next/link';
import { Search, ThreeDotsVertical } from 'react-bootstrap-icons';
import { formatQueryParams } from '@/utils/string-utils';
import { defaultTo, isNotNil, mergeRight } from 'ramda';
import { cn } from '@/utils/shadcn-utils';
import { isMatching } from 'ts-pattern';
import SearchInput from '@/components/pages/all/SearchInput';
import { Button } from '@/components/shadcn/button';

interface CollectionsPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
export default async function CollectionsPage(props: CollectionsPageProps) {
  const searchParams = await props.searchParams;
  const { collections, hasMore, nextPageCursor, results } = await api.searchCollections({
    search: searchParams.search ?? '',
    cursor: defaultTo(undefined, Number(searchParams.cursor)),
    sortBy: searchParams.sortBy ?? '_text_match',
    orderBy: searchParams.orderBy ?? 'desc',
    perPage: 48,
  });

  return (
    <div className='flex w-full justify-center'>
      <div className='flex max-w-screen-2xl flex-col items-center gap-6 px-2 py-5 lg:px-10'>
        {searchParams.tutorial === 'true' && (
          <div className='flex w-full flex-col items-center gap-2 rounded-xl border-2 border-cyan-900 bg-cyan-700 p-6 text-cyan-100'>
            To download a collection, browse for collections here, then look for these buttons!
            <div className='pointer-events-none flex w-full max-w-[200px] flex-col gap-2'>
              <Button className='w-full rounded rounded-r-none bg-slate-600 p-3 text-center transition hover:bg-slate-500 hover:shadow-xl'>
                Download maps
              </Button>
              <div className='flex w-full'>
                <Button className='w-full rounded rounded-r-none bg-slate-600 p-3 text-center transition hover:bg-slate-500 hover:shadow-xl'>
                  Add to osu!
                </Button>
                <div className='hidden h-full cursor-pointer rounded rounded-l-none bg-slate-600 transition hover:bg-slate-500 hover:shadow-xl sm:flex'>
                  <div className='flex items-center'>
                    <ThreeDotsVertical className='mx-2 h-4 w-4' color='currentColor' />
                  </div>
                </div>
              </div>
              <Button className='w-full rounded rounded-r-none bg-slate-600 p-3 text-center opacity-40 transition hover:bg-slate-500 hover:shadow-xl'>
                Favorite (0)
              </Button>
            </div>
          </div>
        )}
        <div className='flex flex-col items-center gap-3'>
          <SearchInput searchParams={searchParams} className='text-center' />
          <div className='text-nowrap flex gap-2 text-2xl'>
            <Search className='mt-1 h-6' color='currentColor' />
            <div className='text-nowrap'>{results} results</div>
          </div>
        </div>
        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-4 shadow-inner md:p-7'>
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            {[
              searchParams.search ? { label: 'Relevance', sortBy: '_text_match', orderBy: 'desc' } : undefined,
              { label: 'Popular', sortBy: 'favourites', orderBy: 'desc' },
              { label: 'Newest', sortBy: 'dateUploaded', orderBy: 'desc' },
              // { label: "Oldest", sortBy: "dateUploaded", orderBy: "asc" }, // FIXME: uncomment once backend returns correct data
              { label: 'osu!std', sortBy: 'osuCount', orderBy: 'desc' },
              { label: 'taiko', sortBy: 'taikoCount', orderBy: 'desc' },
              { label: 'mania', sortBy: 'maniaCount', orderBy: 'desc' },
              { label: 'ctb', sortBy: 'catchCount', orderBy: 'desc' },
            ]
              .filter(isNotNil)
              .map(({ label, sortBy, orderBy }, i) => (
                <Link
                  key={i}
                  href={`/all?${formatQueryParams(mergeRight(searchParams, { sortBy, orderBy, cursor: undefined }))}`}
                  className={cn(
                    'rounded border border-slate-700 bg-slate-900 px-3 py-1 text-center transition hover:bg-slate-600 hover:shadow-xl',
                    isMatching({ sortBy, orderBy })(searchParams)
                      ? 'pointer-events-none border-indigo-800 bg-indigo-800 text-indigo-200 opacity-90'
                      : undefined,
                  )}
                >
                  {label}
                </Link>
              ))}
          </div>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {!collections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              collections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          {hasMore ? (
            <Link href={`/all?${formatQueryParams(mergeRight(searchParams, { cursor: nextPageCursor }))}`}>
              <MoreResultsButton searchParams={searchParams}>More results</MoreResultsButton>
            </Link>
          ) : (
            <div className='text-center text-slate-400'>Reached end of results</div>
          )}
        </div>
      </div>
    </div>
  );
}
