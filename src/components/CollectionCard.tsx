import moment from 'moment';
import BarGraph from '@/components/BarGraph';
import ModeCounters from '@/components/ModeCounters';
import Link from 'next/link';
import Image from 'next/image';
import { getUrlSlug } from '@/utils/string-utils';
import { starToColor } from '@/utils/theme-utils';
import FavouriteButton from '@/components/FavouriteButton';
import UserChip from '@/components/UserChip';

function CollectionCard({ collection }) {
  if (!collection) return <div></div>;

  const href = `/collections/${collection.id}/${getUrlSlug(collection.name)}`;

  return (
    <div className='flex flex-col h-full overflow-hidden transition rounded-lg shadow-lg bg-slate-800 hover:shadow-xl hover:brightness-125'>
      <Link href={href} className='overflow-hidden'>
        {/* Difficulty Spread Graph */}
        <BarGraph
          title='difficulty spread'
          data={{
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => collection.difficultySpread?.[star] ?? 0),
            barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => starToColor(star, true)),
          }}
          height={100}
        />
      </Link>
      <div className='px-4 pt-4'>
        <div className='flex items-center justify-between'>
          <ModeCounters variant='small' collection={collection} />
          <FavouriteButton collection={collection} variant='iconOnly' />
        </div>
      </div>
      <Link href={href} className='flex-grow p-4'>
        <div className='text-lg truncate'>{collection.name}</div>
        {collection.description ? (
          <div className='text-sm line-clamp-3'>{collection.description}</div>
        ) : (
          <small className='text-slate-500'>
            <i>no description</i>
          </small>
        )}
      </Link>
      <div className='flex items-end justify-between px-4 pb-2 '>
        <UserChip user={collection.uploader} className='hover:bg-slate-700 ml-[-8px]' />
        <small className='pb-2 truncate text-slate-400'>
          {moment.unix(collection.dateUploaded._seconds).fromNow()}
        </small>
      </div>
    </div>
  );
}

export default CollectionCard;
