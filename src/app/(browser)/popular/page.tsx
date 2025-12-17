import CollectionCard from '@/components/CollectionCard';
import MoreResultsButton from '@/components/MoreResultsButton';
import { getPopularCollections } from '@/services/osu-collector-api';
import Link from 'next/link';
import { Fire } from 'react-bootstrap-icons';
import { match } from 'ts-pattern';
import { defaultTo, identity } from 'ramda';
import { formatQueryParams } from '@/utils/string-utils';

interface PopularPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
export default async function PopularPage(props: PopularPageProps) {
  const searchParams = await props.searchParams;
  const activeRange = match(searchParams.range)
    .with('today', () => 'today' as const)
    .with('week', () => 'week' as const)
    .with('month', () => 'month' as const)
    .with('year', () => 'year' as const)
    .with('alltime', () => 'alltime' as const)
    .otherwise(() => 'week' as const);
  const popular = await getPopularCollections({
    range: activeRange,
    cursor: defaultTo(undefined, Number(searchParams.cursor)),
    perPage: 48,
  });
  const { collections: popularCollections, hasMore, nextPageCursor } = popular;

  return (
    <div className='flex w-full justify-center'>
      <div className='max-w-screen-2xl px-2 py-5 lg:px-10'>
        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-4 shadow-inner md:p-7'>
          <div className='mb-6 flex items-center justify-between gap-2' style={{ maxWidth: '740px' }}>
            <h1 className='mt-2 text-3xl'>
              <Fire className='mb-2 mr-3 inline text-orange-400' size={32} color='currentColor' />
              Popular collections
            </h1>
            <div className='flex items-center gap-2'>
              {['today', 'week', 'month', 'year', 'alltime'].map((range, i) => {
                const label = match(range)
                  .with('alltime', () => 'all time')
                  .otherwise(identity);
                if (range === activeRange) {
                  return (
                    <button
                      key={i}
                      className='rounded border border-rose-800 bg-rose-800 px-3 py-1 text-rose-300 opacity-90'
                      disabled
                    >
                      {label}
                    </button>
                  );
                } else {
                  return (
                    <Link key={i} href={`/popular?range=${range}`}>
                      <button className='cursor-pointer rounded border border-gray-600 px-3 py-1 text-slate-200 transition hover:bg-slate-500'>
                        {label}
                      </button>
                    </Link>
                  );
                }
              })}
            </div>
          </div>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {!popularCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              popularCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          {hasMore ? (
            <Link
              href={`/popular?${formatQueryParams({
                range: activeRange,
                cursor: nextPageCursor,
              })}`}
            >
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
