import MoreResultsButton from '@/components/MoreResultsButton';
import * as api from '@/services/osu-collector-api';
import Link from 'next/link';
import { CloudUploadFill, Search, TrophyFill } from 'react-bootstrap-icons';
import { formatQueryParams } from '@/utils/string-utils';
import { defaultTo, mergeRight } from 'ramda';
import SearchInput from '@/components/pages/all/SearchInput';
import TournamentCard from '@/components/TournamentCard';
import { Button } from '@/components/shadcn/button';

interface TournamentsPageProps {
  searchParams: { [key: string]: string | undefined };
}
export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const { tournaments, hasMore, nextPageCursor } = await (async () => {
    if (searchParams.search) {
      const { tournaments, hasMore, nextPageCursor } = await api.searchTournaments({
        search: (searchParams.search as string) ?? '',
        cursor: searchParams.cursor as string,
        sortBy: (searchParams.sortBy as string) ?? '_text_match',
        orderBy: (searchParams.orderBy as string) ?? 'desc',
        perPage: 48,
      });
      return { tournaments, hasMore, nextPageCursor };
    } else {
      const { tournaments, hasMore, nextPageCursor } = await api.getRecentTournaments({
        cursor: defaultTo(undefined, Number(searchParams.cursor)),
        perPage: 48,
      });
      return { tournaments, hasMore, nextPageCursor };
    }
  })();

  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col items-center w-full gap-6 px-2 py-5 md:px-10'>
        <div className='w-full p-4 mb-4 rounded max-w-screen-2xl bg-[#162032] md:p-7'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-3xl whitespace-nowrap'>
              <TrophyFill className='inline mb-1 mr-3 text-yellow-400' size={24} />
              Tournaments
            </h1>
            <div className='flex flex-col w-full gap-3 ml-6'>
              <SearchInput searchParams={searchParams} withIcon className='bg-slate-800' />
            </div>
            <Link href='/tournaments/upload'>
              <Button className='gap-x-2'>
                <CloudUploadFill className='mt-1' />
                Upload Tournament
              </Button>
            </Link>
          </div>
          <div className='grid grid-cols-1 gap-4 mb-5 md:gap-8 lg:grid-cols-2'>
            {!tournaments ? (
              <div className='text-red-500'>There was an error retrieving tournaments.</div>
            ) : (
              tournaments.map((tournament, i) => <TournamentCard key={i} tournament={tournament} />)
            )}
          </div>
          {hasMore ? (
            <Link href={`/tournaments?${formatQueryParams(mergeRight(searchParams, { cursor: nextPageCursor }))}`}>
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
