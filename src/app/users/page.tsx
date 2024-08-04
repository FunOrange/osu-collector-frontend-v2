import MoreResultsButton from '@/components/MoreResultsButton';
import * as api from '@/services/osu-collector-api';
import Link from 'next/link';
import { PersonFill } from 'react-bootstrap-icons';
import { formatQueryParams } from '@/utils/string-utils';
import { mergeRight } from 'ramda';
import UserCard from '@/components/UserCard';

interface UsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { users, nextPage } = await api.getUsers({
    page: searchParams.page || 1,
    perPage: searchParams.perPage || 50,
  });

  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col items-center w-full gap-6 px-2 py-5 md:px-10'>
        {/* <div className='flex flex-col items-center gap-3'> */}
        {/*   <SearchInput searchParams={searchParams} withIcon /> */}
        {/* </div> */}
        <div className='w-full p-4 mb-4 rounded max-w-screen-2xl border-slate-900 shadow-inner bg-[#162032] md:p-7'>
          <h1 className='mb-6 text-3xl'>
            <PersonFill className='inline mb-1 mr-3 text-blue-200' size={24} />
            Users
          </h1>

          <div className='grid gap-4 mb-5 md:gap-8 lg:grid-cols-3 xs:grid-cols-1 sm:grid-cols-2'>
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
