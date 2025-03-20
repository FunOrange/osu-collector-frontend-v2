import MoreResultsButton from '@/components/MoreResultsButton';
import * as api from '@/services/osu-collector-api';
import Link from 'next/link';
import { PersonFill } from 'react-bootstrap-icons';
import { formatQueryParams } from '@/utils/string-utils';
import { mergeRight } from 'ramda';
import UserCard from '@/components/UserCard';
import { Metadata } from 'next';
import SearchInput from '@/components/pages/all/SearchInput';

export const metadata: Metadata = {
  title: 'osu!Collector | Find osu! beatmap collections',
  description: 'Find osu! beatmap collections and tournaments',
};

interface UsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { users, nextPage } = await api.getUsers({
    page: searchParams.page || 1,
    perPage: searchParams.perPage || 48,
    username: searchParams.search,
  });

  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col items-center w-full gap-6 px-2 py-5 md:px-10'>
        <div className='w-full p-4 mb-4 rounded max-w-screen-2xl border-slate-900 shadow-inner bg-[#162032] md:p-7'>
          <div className='mb-6 flex items-center gap-6'>
            <h1 className='text-3xl whitespace-nowrap'>
              <PersonFill className='inline mb-1 mr-3 text-blue-200' size={24} />
              Users
            </h1>
            <div className='flex flex-col gap-3'>
              <SearchInput searchParams={searchParams} withIcon className='bg-slate-800' />
            </div>
          </div>

          <div className='grid gap-2 mb-5 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            {!users ? (
              <div className='text-red-500'>There was an error retrieving users.</div>
            ) : (
              users.map((user, i) => <UserCard key={i} user={user} />)
            )}
          </div>
          {nextPage ? (
            <Link href={`/users?${formatQueryParams(mergeRight(searchParams, { page: nextPage }))}`}>
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
