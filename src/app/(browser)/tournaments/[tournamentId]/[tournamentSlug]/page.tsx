import FavouriteButton from '@/components/FavouriteButton';
import DownloadMapsButton from '@/components/pages/tournaments/[tournamentId]/DownloadMapsButton';
import AddTournamentToOsuButton from '@/components/pages/tournaments/[tournamentId]/AddTournamentToOsuButton';
import TournamentDeleteButton from '@/components/pages/tournaments/[tournamentId]/TournamentDeleteButton';
import TournamentEditButton from '@/components/pages/tournaments/[tournamentId]/TournamentEditButton';
import TournamentUpdateButton from '@/components/pages/tournaments/[tournamentId]/TournamentUpdateButton';
import TournamentMappool from '@/components/pages/tournaments/[tournamentId]/TournamentMappool';
import ImageWithFallback from '@/components/universal/ImageWithFallback';
import * as api from '@/services/osu-collector-api';
import { formatQueryParams, getUrlSlug } from '@/utils/string-utils';
import moment from 'moment';
import { identity, mergeRight } from 'ramda';
import { Pattern, match } from 'ts-pattern';
import { Metadata } from 'next';
import UserChip from '@/components/UserChip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import { cn } from '@/utils/shadcn-utils';
import { notFound } from 'next/navigation';
import { tryCatch } from '@/utils/try-catch';
import { Tournament } from '@/shared/entities/v1';
import { AxiosError } from 'axios';

export async function generateMetadata({ params }): Promise<Metadata> {
  const tournament = await api.getTournament(params.tournamentId).catch(() => null);
  if (!tournament) return {};

  const title = `${tournament.name} | osu!Collector`;
  const description = tournament.description || `Tournament uploaded by ${tournament?.uploader.username}`;
  return {
    metadataBase: new URL('https://osucollector.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://osucollector.com/collections/${tournament.id}/${getUrlSlug(tournament.name)}`,
      images: [tournament.banner].filter(Boolean),
    },
  };
}

interface TournamentPageProps {
  params: { tournamentId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function TournamentPage({ params, searchParams }: TournamentPageProps) {
  const [tournament, error] = await tryCatch<Tournament, AxiosError>(api.getTournament(params.tournamentId));
  if (error) {
    if (error?.response?.status === 404) {
      notFound();
    } else {
      throw error;
    }
  }

  const searchParamsSortBy = match(searchParams.sortBy)
    .with('beatmapset.artist', identity)
    .with('beatmapset.title', identity)
    .with('beatmapset.creator', identity)
    .with('difficulty_rating', identity)
    .with('bpm', identity)
    .with('hit_length', identity)
    .otherwise(() => undefined);
  const searchParamsOrderBy = match(searchParams.orderBy)
    .with('asc', identity)
    .with('desc', identity)
    .otherwise(() => undefined);
  const { orderBy, sortBy } = match({ searchParamsSortBy, searchParamsOrderBy })
    .with({ searchParamsSortBy: Pattern.string, searchParamsOrderBy: Pattern.string }, () => ({
      sortBy: searchParamsSortBy,
      orderBy: searchParamsOrderBy,
    }))
    .otherwise(() => ({
      sortBy: 'beatmapset.artist',
      orderBy: 'asc',
    }));

  const pathname = `/tournaments/${tournament.id}/${getUrlSlug(tournament.name)}`;

  const replaceQueryParams = (newParams: any) =>
    `${pathname}?${formatQueryParams(mergeRight(searchParams, newParams))}`;

  const bannerHeight = 330;
  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col w-full max-w-screen-xl gap-2 px-2 py-5 md:px-10'>
        <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
          <div className='relative' style={{ height: `${bannerHeight}px` }}>
            <div className='absolute w-full overflow-hidden rounded-t-lg' style={{ height: `${bannerHeight}px` }}>
              <ImageWithFallback
                src={tournament.banner}
                fallbackSrc={'/images/slimcoverfallback.jpg'}
                alt={tournament.name}
                className='rounded-t-lg'
                style={{ transition: 'filter 0.1s', objectFit: 'cover' }}
                fill
                sizes='100vw'
              />
            </div>
          </div>
          <div className='p-6'>
            <h1 className='text-4xl rounded'>{tournament.name}</h1>
            <div className='grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className='pr-4'>
                <Popover>
                  <PopoverTrigger className='text-sm text-slate-400 hover:text-slate-200'>
                    Uploaded {moment.unix(tournament.dateUploaded._seconds).fromNow()}
                  </PopoverTrigger>
                  <PopoverContent side='top' align='center' className='py-2 text-xs w-38'>
                    {moment.unix(tournament.dateUploaded._seconds).format('LLL')}
                  </PopoverContent>
                </Popover>
                <div
                  className='grid items-center w-full pt-2 gap-x-4 gap-y-1'
                  style={{ gridTemplateColumns: 'auto 1fr' }}
                >
                  <div className='py-2 pr-6 border-r border-slate-700 text-slate-200'>Uploader</div>
                  <div className='flex items-center gap-1'>
                    <UserChip
                      user={tournament.uploader}
                      href={`/users/${tournament.uploader.id}/uploads/tournaments`}
                    />
                  </div>
                  {tournament.organizers.length > 0 && (
                    <>
                      <div className='py-2 pr-6 border-r border-slate-700 text-slate-200'>Organizers</div>
                      <div className='flex items-center gap-1'>
                        {tournament.organizers.map((organizer, i) => (
                          <UserChip key={i} user={organizer} href={`https://osu.ppy.sh/users/${organizer.id}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className='grid mt-2 gap-x-3 gap-y-1' style={{ gridTemplateColumns: 'auto 1fr' }}>
                  <div>Forum post:</div>
                  <a target='_blank' href={tournament.link} className='underline truncate'>
                    {tournament.link}
                  </a>
                  {/* <div>Spreadsheet:</div>
                  {false ? (
                    <a target="_blank" href={tournament.downloadUrl} className="underline truncate">
                      {tournament.downloadUrl}
                    </a>
                  ) : (
                    <div className="text-slate-500">No spreadsheet link provided.</div>
                  )} */}
                  <div>Mappool download:</div>
                  {tournament?.downloadUrl ? (
                    <a target='_blank' href={tournament.downloadUrl} className='underline truncate'>
                      {tournament.downloadUrl}
                    </a>
                  ) : (
                    <div className='text-slate-500'>No download link provided.</div>
                  )}

                  <div className='relative'>
                    <div className={cn('px-3 py-2 whitespace-pre-wrap rounded bg-slate-800 mt-2')}>
                      {tournament.description || 'No description provided.'}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col justify-end gap-2 pl-4 border-l border-slate-700'>
                <TournamentDeleteButton tournament={tournament} />
                <TournamentEditButton tournament={tournament} />
                <DownloadMapsButton tournament={tournament} />
                <AddTournamentToOsuButton tournament={tournament} />
                <FavouriteButton tournament={tournament} variant='fullWidth' />
                <TournamentUpdateButton />
              </div>
            </div>
          </div>
        </div>

        {/* <TournamentCommentsSection collection={collection} /> */}
        <div className='rounded bg-slate-900' style={{ minHeight: 'calc(100vh - 56px)' }}>
          <TournamentMappool tournament={tournament} />
        </div>
      </div>
    </div>
  );
}
