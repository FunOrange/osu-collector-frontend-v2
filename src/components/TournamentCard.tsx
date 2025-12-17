'use client';
import { getUrlSlug } from '@/utils/string-utils';
import { Tournament } from '@/shared/entities/v1/Tournament';
import ImageWithFallback from '@/components/universal/ImageWithFallback';
import Link from 'next/link';
import moment from 'moment';
import { Pattern, match } from 'ts-pattern';

export interface TournamentCardProps {
  tournament: Tournament;
}
function TournamentCard({ tournament }: TournamentCardProps) {
  const height = 200;
  const dateUploaded = match(tournament.dateUploaded)
    .with({ _seconds: Pattern.number }, ({ _seconds }) => moment.unix(_seconds))
    .with(Pattern.string, (date) => moment(date))
    .otherwise(() => moment());

  return (
    <div className={`relative flex flex-col justify-end rounded-lg bg-gray-950`} style={{ height: `${height}px` }}>
      <Link
        href={`/tournaments/${tournament.id}/${getUrlSlug(tournament.name)}`}
        className='absolute w-full overflow-hidden rounded-lg'
        style={{ height: `${height}px` }}
      >
        <ImageWithFallback
          src={tournament.banner}
          fallbackSrc={'/images/slimcoverfallback.jpg'}
          alt={tournament.name}
          className='rounded-lg brightness-90 hover:brightness-110'
          style={{ transition: 'filter 0.1s', objectFit: 'cover' }}
          fill
          sizes='100vw'
        />
      </Link>
      <div className='relative z-10 rounded-b-lg bg-gray-950 bg-opacity-50 py-2 pl-3 pr-1'>
        <div className='flex justify-between'>
          <div
            className='truncate text-sm font-medium text-white'
            style={{
              textShadow: '2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000',
            }}
          >
            {tournament.name}
          </div>
          <div className='truncate text-sm font-medium text-gray-100'>
            <span className='text-slate-200'>
              Uploaded {dateUploaded.fromNow()} by {tournament.uploader.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentCard;
