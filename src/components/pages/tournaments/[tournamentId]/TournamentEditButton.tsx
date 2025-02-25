'use client';
import { Tournament } from '@/shared/entities/v1/Tournament';
import { useUser } from '@/services/osu-collector-api-hooks';
import Link from 'next/link';
import { prop } from 'ramda';
import { getUrlSlug } from '@/utils/string-utils';

export interface TournamentEditButtonProps {
  tournament: Tournament;
}
export default function TournamentEditButton({ tournament }: TournamentEditButtonProps) {
  const { user } = useUser();
  return (
    (tournament.organizers.map(prop('id')).includes(user?.id) || tournament.uploader.id === user?.id) && (
      <Link
        href={`/tournaments/${tournament.id}/${getUrlSlug(tournament.name)}/edit`}
        className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-blue-800'
      >
        Edit tournament
      </Link>
    )
  );
}
