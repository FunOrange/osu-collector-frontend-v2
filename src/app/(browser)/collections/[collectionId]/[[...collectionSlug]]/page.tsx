'use server';
import { Metadata } from 'next';
import moment from 'moment';
import ModeCounters from '@/components/ModeCounters';
import * as api from '@/services/osu-collector-api';
import { getUrlSlug } from '@/utils/string-utils';
import FavouriteButton from '@/components/FavouriteButton';
import DownloadMapsButton from '@/components/pages/collections/[collectionId]/DownloadMapsButton';
import AddToOsuButton from '@/components/pages/collections/[collectionId]/AddToOsuButton';
import CollectionCommentsSection from '@/components/pages/collections/[collectionId]/CollectionCommentsSection';
import EditableCollectionName from '@/components/pages/collections/[collectionId]/EditableCollectionName';
import CollectionDeleteButton from '@/components/pages/collections/[collectionId]/CollectionDeleteButton';
import EditableCollectionDescription from '@/components/pages/collections/[collectionId]/EditableCollectionDescription';
import CollectionUpdateButton from '@/components/pages/collections/[collectionId]/CollectionUpdateButton';
import UserChip from '@/components/UserChip';
import { notFound } from 'next/navigation';
import CollectionBeatmapsSection from '@/components/pages/collections/[collectionId]/CollectionBeatmapsSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import { defaultTo } from 'ramda';

export async function generateMetadata({ params }): Promise<Metadata> {
  const collection = await api.getCollection(params.collectionId).catch(() => null);
  if (!collection) return {};

  const title = `${collection.name} | osu!Collector`;
  const description = collection.description || `Collection uploaded by ${collection.uploader.username}`;
  return {
    metadataBase: new URL('https://osucollector.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://osucollector.com/collections/${collection.id}/${getUrlSlug(collection.name)}`,
      images: [`https://a.ppy.sh/${collection.uploader.id}`],
    },
  };
}

interface CollectionPageProps {
  params: { collectionId: string };
}
export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await api.getCollection(Number(params.collectionId)).catch((e) => {
    if (e.response?.status === 404) return null;
    throw e;
  });
  if (collection === null) {
    notFound();
  }

  return (
    <div className='flex w-full justify-center bg-[#162032] sm:bg-transparent'>
      <div className='flex w-full max-w-screen-xl flex-col gap-4 px-2 py-5 md:gap-7 md:px-10'>
        <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
          <div className='flex flex-col gap-x-4 gap-y-2 sm:p-4'>
            <div className='flex flex-col justify-between gap-2 xl:flex-row'>
              <EditableCollectionName collection={collection} className='pl-2' />
              <ModeCounters variant='full' collection={collection} />
            </div>
            <div className='flex flex-col gap-y-3 sm:grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className='flex flex-col gap-y-2 sm:gap-y-0'>
                <div className='flex items-center'>
                  <UserChip
                    user={collection.uploader}
                    href={`/users/${collection.uploader.id}/uploads/collections`}
                    className='mr-2'
                  />
                  <Popover>
                    <PopoverTrigger className='text-sm text-slate-400 hover:text-slate-200'>
                      Uploaded {moment.unix(collection.dateUploaded._seconds).fromNow()}
                    </PopoverTrigger>
                    <PopoverContent side='top' align='center' className='w-38 py-2 text-xs'>
                      {moment.unix(collection.dateUploaded._seconds).format('LLL')}
                    </PopoverContent>
                  </Popover>
                  {collection.dateLastModified._seconds - collection.dateUploaded._seconds > 3600 && (
                    <Popover>
                      <PopoverTrigger className='text-sm text-slate-400 hover:text-slate-200'>
                        , last updated {moment.unix(collection.dateLastModified._seconds).fromNow()}
                      </PopoverTrigger>
                      <PopoverContent side='top' align='center' className='w-38 py-2 text-xs'>
                        {moment.unix(collection.dateLastModified._seconds).format('LLL')}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className='w-full sm:pr-4 sm:pt-4'>
                  <EditableCollectionDescription collection={collection} />
                </div>
              </div>
              <div className='flex flex-col justify-end gap-2'>
                <CollectionDeleteButton collection={collection} />
                <DownloadMapsButton collection={collection} />
                <AddToOsuButton collection={collection} />
                <FavouriteButton collection={collection} variant='fullWidth' />
                <CollectionUpdateButton collection={collection} />
              </div>
            </div>
          </div>
        </div>

        <CollectionCommentsSection collection={collection} />

        <CollectionBeatmapsSection collection={collection} />
      </div>
    </div>
  );
}
