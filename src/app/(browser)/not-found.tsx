import { match } from 'ts-pattern';

export default function NotFound() {
  const pathname = ''; // FIXME: how to get pathname from server component?
  const type: 'collection' | 'tournament' | 'user' | 'other' = pathname?.startsWith('collections')
    ? 'collection'
    : pathname?.startsWith('tournaments')
      ? 'tournament'
      : pathname?.startsWith('users')
        ? 'user'
        : 'other';
  return (
    <div className='flex h-[calc(100vh-14px*4)] w-full items-center justify-center'>
      <div className='flex items-center gap-4'>
        <div className='text-bold text-lg'>404</div>
        <div className='h-12 border-r border-slate-500' />
        <div className='flex flex-col justify-center whitespace-pre-line text-sm'>
          {match(type)
            .with('collection', () => 'This collection could not be found.')
            .with('tournament', () => 'This tournament could not be found.')
            .with(
              'user',
              () =>
                'This user could not be found.\n(Users must log in to osu!Collector at least once to be able to view their profile)',
            )
            .with('other', () => 'This page could not be found.')
            .exhaustive()}
          <br />
        </div>
      </div>
    </div>
  );
}
