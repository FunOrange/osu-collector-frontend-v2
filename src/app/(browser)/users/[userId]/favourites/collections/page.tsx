import CollectionCard from '@/components/CollectionCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import * as api from '@/services/osu-collector-api';
import { s } from '@/utils/string-utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }): Promise<Metadata> {
  const pageUser = await api.getUser(params.userId).catch(() => null);
  if (!pageUser) return {};

  const title = `${pageUser.osuweb.username}'s Collections | osu!Collector`;
  const description = `Collections favourited by ${pageUser.osuweb.username}`;
  return {
    metadataBase: new URL('https://osucollector.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://osucollector.com/users/${params.userId}/favourites/collections`,
      images: [pageUser.osuweb.avatar_url].filter(Boolean),
    },
  };
}

interface PageProps {
  params: { userId: string };
}
export default async function UserFavouriteCollectionsPage({ params }: PageProps) {
  const [pageUser, collections] = await Promise.all([
    api.getUser(params.userId),
    api.getUserFavouriteCollections(params.userId),
  ]).catch(() => [null, null]);
  if (!pageUser) {
    notFound();
  }

  return (
    <div className='flex w-full justify-center'>
      <div className='w-full max-w-screen-2xl px-2 py-5 md:px-10'>
        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-4 shadow-inner md:p-7'>
          <h2 className='mb-6 flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={pageUser.osuweb.avatar_url} alt='@shadcn' />
              <AvatarFallback>{pageUser.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className='mb-0 text-2xl'>{pageUser.osuweb.username}</h1>
              <a
                className='block text-xs leading-none text-muted-foreground transition-colors hover:text-blue-500'
                href={`https://osu.ppy.sh/users/${pageUser.id}`}
              >
                {`https://osu.ppy.sh/users/${pageUser.id}`}
              </a>
            </div>
          </h2>
          <h1 className='mb-2 text-2xl'>
            {collections.length === 1
              ? `${pageUser.osuweb.username} favourited this collection:`
              : `${pageUser.osuweb.username} favourited these ${collections.length} collections:`}
          </h1>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4'>
            {!collections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              collections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
