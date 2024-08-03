import CollectionCard from '@/components/CollectionCard';
import { getMetadata, getPopularCollections, getRecentCollections } from '@/services/osu-collector-api';
import Link from 'next/link';
import { Discord, Fire, Stars } from 'react-bootstrap-icons';

export default async function HomePage() {
  const [metadata, popularCollections, recentCollections] = await Promise.all([
    getMetadata(),
    getPopularCollections({
      range: 'month',
      perPage: 12,
    }).then((data) => data.collections),
    getRecentCollections({ perPage: 12 }).then((data) => data.collections),
  ]);

  return (
    <div className='flex justify-center w-full'>
      <div className='px-2 py-5 md:px-10 max-w-screen-2xl'>
        <div className='p-4 mb-4 text-center rounded bg-sky-900 text-sky-200'>
          <Discord className='inline mb-1 mr-2' size={20} />
          Join the{' '}
          <a href='https://discord.gg/WZMQjwF5Vr' className='text-blue-500'>
            osu!Collector discord
          </a>
          ! Feel free to message FunOrange about any issues you have or suggestions for the site.
        </div>

        <div className='items-center justify-between gap-6 mb-4 md:flex'>
          <div className='my-2'>
            <h1 className='mb-1 text-3xl'>Welcome to osu!Collector!</h1>
            <p>
              This is a place where you can view beatmap collections uploaded by other players. It is mainly developed
              by{' '}
              <a href='https://twitter.com/funorange42' className='text-blue-500'>
                FunOrange
              </a>{' '}
              and{' '}
              <a href='https://twitter.com/mahloola' className='text-blue-500'>
                mahloola
              </a>
              . If you like the project, consider supporting us to get access to{' '}
              <Link href='/client' className='text-blue-500'>
                extra features
              </Link>
              .
            </p>
          </div>

          <div className='flex flex-col justify-center gap-4 mb-3 md:flex-row'>
            <div className='px-4 py-3 rounded md:px-6 border-slate-900 shadow-inner bg-[#162032]'>
              <div className='text-xl'>{metadata.userCount.toLocaleString()}</div>
              <div className='text-sm whitespace-nowrap'>Total users</div>
            </div>

            <div className='px-4 py-3 rounded md:px-6 border-slate-900 shadow-inner bg-[#162032]'>
              <div className='text-xl'>{metadata.totalCollections.toLocaleString()}</div>
              <div className='text-sm whitespace-nowrap'>Total collections</div>
            </div>
          </div>
        </div>

        <div className='p-2 pt-4 mb-4 rounded md:pt-7 border-slate-900 shadow-inner bg-[#162032] md:p-7'>
          <h2 className='mb-3 text-2xl md:mb-6 md:text-3xl'>
            <Fire className='inline mb-2 mr-3 text-orange-400' size={32} />
            Popular this month
          </h2>
          <div className='grid grid-cols-1 gap-4 mb-5 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {!popularCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              popularCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          <Link href='/popular?range=month'>
            <div className='w-full p-3 text-center transition rounded bg-slate-800 hover:shadow-xl hover:bg-slate-600'>
              See all popular
            </div>
          </Link>
        </div>

        <div className='p-2 pt-4 mb-4 rounded md:pt-7 border-slate-900 shadow-inner bg-[#162032] md:p-7'>
          <h2 className='mb-3 text-2xl md:mb-6 md:text-3xl'>
            <Stars className='inline mb-1 mr-3 text-yellow-400' size={24} />
            Recently Uploaded
          </h2>
          <div className='grid grid-cols-1 gap-4 mb-5 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {!recentCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              recentCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          <Link href='/recent'>
            <div className='w-full p-3 text-center transition rounded bg-slate-800 hover:shadow-xl hover:bg-slate-600'>
              See all recent
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
