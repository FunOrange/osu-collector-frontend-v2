import TournamentCard from '@/components/TournamentCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import * as api from '@/services/osu-collector-api';
import { s } from '@/utils/string-utils';
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const pageUser = await api.getUser(params.userId).catch(() => null);
  if (!pageUser) return {};

  const title = `${pageUser.osuweb.username}'s Tournaments | osu!Collector`;
  const description = `Tournaments uploaded by ${pageUser.osuweb.username}`;
  return {
    metadataBase: new URL('https://osucollector.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://osucollector.com/users/${params.userId}/uploads/tournamants`,
      images: [pageUser.osuweb.avatar_url].filter(Boolean),
    },
  };
}

interface PageProps {
  params: { userId: string };
}
export default async function UserUploadedTournamentsPage({ params }: PageProps) {
  const [pageUser, uploads] = await Promise.all([api.getUser(params.userId), api.getUserUploads(params.userId)]).catch(
    () => [null, null],
  );
  if (!pageUser) {
    return <div className='mt-16 text-3xl text-center text-red-500'>No such user exists.</div>;
  }
  const tournaments = uploads?.tournaments;

  return (
    <div className='flex justify-center w-full'>
      <div className='w-full px-2 py-5 md:px-10 max-w-screen-2xl'>
        <div className='p-4 mb-4 rounded border-slate-900 shadow-inner bg-[#162032] md:p-7'>
          <h2 className='flex items-center gap-3 mb-6'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={pageUser.osuweb.avatar_url} alt='@shadcn' />
              <AvatarFallback>{pageUser.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className='mb-0 text-2xl'>{pageUser.osuweb.username}</h1>
              <a
                className='block text-xs leading-none transition-colors text-muted-foreground hover:text-blue-500'
                href={`https://osu.ppy.sh/users/${pageUser.id}`}
              >
                {`https://osu.ppy.sh/users/${pageUser.id}`}
              </a>
            </div>
          </h2>
          <h1 className='mb-2 text-2xl'>
            {tournaments.length} uploaded tournament{s(tournaments.length)}
          </h1>
          <div className='grid grid-cols-1 gap-4 mb-5 md:gap-8 lg:grid-cols-2'>
            {!tournaments ? (
              <div className='text-red-500'>There was an error retrieving tournaments.</div>
            ) : (
              tournaments.map((tournament, i) => <TournamentCard key={i} tournament={tournament} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
