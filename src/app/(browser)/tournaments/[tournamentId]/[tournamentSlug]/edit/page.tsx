import TournamentForm from '@/components/pages/tournaments/[tournamentId]/TournamentForm';
import * as api from '@/services/osu-collector-api';
import { redirect } from 'next/navigation';

export default async function Page({ params }) {
  try {
    const tournament = await api.getTournament(params.tournamentId);
    return <TournamentForm tournament={tournament} />;
  } catch (error) {
    if (error.response?.status === 404) {
      return (
        <div className='w-full h-full flex justify-center items-center flex-grow'>
          <div>
            Tournament with ID <b>{params.tournamentId}</b> not found.
          </div>
        </div>
      );
    } else {
      console.error(error);
      throw error;
    }
  }
}
