import CollectionCard from '@/components/CollectionCard';
import MoreResultsButton from '@/components/MoreResultsButton';
import { getRecentCollections } from '@/services/osu-collector-api';
import Link from 'next/link';
import { defaultTo } from 'ramda';
import { Stars } from 'react-bootstrap-icons';

interface RecentPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
export default async function RecentPage(props: RecentPageProps) {
  const searchParams = await props.searchParams;
  const recent = await getRecentCollections({
    cursor: defaultTo(undefined, Number(searchParams.cursor)),
    perPage: 48,
  });
  const { collections: recentCollections, hasMore, nextPageCursor } = recent;

  return (
    <div className='flex w-full justify-center'>
      <div className='max-w-screen-2xl px-2 py-5 lg:px-10'>
        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-4 shadow-inner md:p-7'>
          <h1 className='mb-6 text-3xl'>
            <Stars className='mb-1 mr-3 inline text-yellow-400' size={24} />
            Recent collections
          </h1>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {!recentCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              recentCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          {hasMore ? (
            <Link href={`/recent?cursor=${nextPageCursor}`}>
              <MoreResultsButton>More results</MoreResultsButton>
            </Link>
          ) : (
            <div className='text-center text-slate-400'>Reached end of results</div>
          )}
        </div>
      </div>
    </div>
  );
}
