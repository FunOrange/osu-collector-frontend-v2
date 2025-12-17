'use client';
import Image from 'next/image';
import CollectionCard from '@/components/CollectionCard';
import { Collection } from '@/shared/entities/v1/Collection';
import Link from 'next/link';
import { Discord, Fire, Stars } from 'react-bootstrap-icons';

export interface HomeProps {
  metadata: any;
  popularCollections: Collection[];
  recentCollections: Collection[];
}
export default function Home({ metadata, popularCollections, recentCollections }: HomeProps) {
  return (
    <div className='flex w-full justify-center'>
      <div className='w-full max-w-screen-2xl px-2 py-5 md:px-10'>
        <div className='mb-4 rounded bg-sky-900 p-4 text-center text-sky-200'>
          <Discord className='mb-1 mr-2 inline' size={20} />
          Join the{' '}
          <a href='https://discord.gg/WZMQjwF5Vr' className='text-blue-500'>
            osu!Collector discord
          </a>
          ! Feel free to message FunOrange about any issues you have or suggestions for the site.
        </div>

        <div className='mb-4 items-center justify-between gap-6 md:flex'>
          <div className='my-2'>
            <div className='mb-1 flex items-end gap-3'>
              <h1 className='text-3xl'>Welcome to osu!Collector!</h1>
            </div>
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

          <div className='mb-3 grid grid-cols-2 flex-row justify-center gap-4 md:flex'>
            <div className='rounded border-slate-900 bg-[#162032] px-4 py-3 shadow-inner md:px-6'>
              <div className='text-xl'>{metadata.userCount.toLocaleString()}</div>
              <div className='whitespace-nowrap text-sm'>Total users</div>
            </div>

            <div className='rounded border-slate-900 bg-[#162032] px-4 py-3 shadow-inner md:px-6'>
              <div className='text-xl'>{metadata.totalCollections.toLocaleString()}</div>
              <div className='whitespace-nowrap text-sm'>Total collections</div>
            </div>
          </div>
        </div>

        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-2 pt-4 shadow-inner md:p-7 md:pt-7'>
          <h2 className='mb-3 text-2xl md:mb-6 md:text-3xl'>
            <Fire className='mb-2 mr-3 inline text-orange-400' size={32} />
            Popular this month
          </h2>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {!popularCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              popularCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          <Link href='/popular?range=month'>
            <div className='w-full rounded bg-slate-800 p-3 text-center transition hover:bg-slate-600 hover:shadow-xl'>
              See all popular
            </div>
          </Link>
        </div>

        <div className='mb-4 rounded border-slate-900 bg-[#162032] p-2 pt-4 shadow-inner md:p-7 md:pt-7'>
          <h2 className='mb-3 text-2xl md:mb-6 md:text-3xl'>
            <Stars className='mb-1 mr-3 inline text-yellow-400' size={24} />
            Recently Uploaded
          </h2>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4'>
            {!recentCollections ? (
              <div className='text-red-500'>There was an error retrieving collections.</div>
            ) : (
              recentCollections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          <Link href='/recent'>
            <div className='w-full rounded bg-slate-800 p-3 text-center transition hover:bg-slate-600 hover:shadow-xl'>
              See all recent
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
