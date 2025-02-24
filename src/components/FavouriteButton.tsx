'use client';
import { useUser } from '@/services/osu-collector-api-hooks';
import { HeartFill } from 'react-bootstrap-icons';
import * as api from '@/services/osu-collector-api';
import { assocPath, concat, without } from 'ramda';
import { useState } from 'react';
import { match } from 'ts-pattern';
import md5 from 'md5';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { formatQueryParams } from '@/utils/string-utils';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { Collection } from '@/shared/entities/v1/Collection';
import { Tournament } from '@/shared/entities/v1/Tournament';

export type FavouriteButtonProps = {
  collection?: Collection;
  tournament?: Tournament;
  variant: 'iconOnly' | 'fullWidth';
};
export default function FavouriteButton({ collection, tournament, variant }: FavouriteButtonProps) {
  const { user, mutate } = useUser();
  const favourited =
    user?.favourites?.includes(collection?.id) ?? user?.favouriteTournaments?.includes(tournament?.id) ?? false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hovered, setHovered] = useState(false);

  const [localOffset, setLocalOffset] = useState(0);
  const favouriteCount = collection?.favourites + localOffset;
  const onClick = async () => {
    if (!user) return;

    if (collection && favourited) {
      setLocalOffset((prev) => prev - 1);
      await mutate(api.unfavouriteCollection(collection.id) as any, {
        optimisticData: (data) =>
          assocPath(['user', 'favourites'], without([collection.id], user?.favourites ?? []), data),
        populateCache: false,
      });
    } else if (collection && !favourited) {
      setLocalOffset((prev) => prev + 1);
      await mutate(api.favouriteCollection(collection.id) as any, {
        optimisticData: (data) =>
          assocPath(['user', 'favourites'], concat([collection.id], user?.favourites ?? []), data),
        populateCache: false,
      });
    } else if (tournament && favourited) {
      await mutate(api.favouriteTournament(tournament.id, true) as any, {
        optimisticData: (data) =>
          assocPath(
            ['user', 'favouriteTournaments'],
            concat([tournament.id], data.user.favouriteTournaments ?? []),
            data,
          ),
        populateCache: false,
      });
    } else if (tournament && !favourited) {
      await mutate(api.favouriteTournament(tournament.id, false) as any, {
        optimisticData: (data) =>
          assocPath(
            ['user', 'favouriteTournaments'],
            concat([tournament.id], data.user.favouriteTournaments ?? []),
            data,
          ),
        populateCache: false,
      });
    }
  };

  const favouriteButton = match(variant)
    .with('iconOnly', () => {
      const heartIconColor = match({ favourited, hovered })
        .with({ favourited: false, hovered: false }, () => '#64748b')
        .with({ favourited: false, hovered: true }, () => '#94a3b8')
        .with({ favourited: true, hovered: false }, () => '#f43f5e')
        .with({ favourited: true, hovered: true }, () => '#fda4af')
        .exhaustive();
      return (
        <div className='flex items-center gap-2'>
          <HeartFill
            className='transition cursor-pointer fill-current'
            size={18}
            style={{ marginTop: '2px', color: heartIconColor }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
          {collection && <div>{favouriteCount}</div>}
        </div>
      );
    })
    .with('fullWidth', () => {
      const { bg, fg } = match({ favourited, hovered })
        .with({ favourited: false, hovered: false }, () => ({ bg: '#475569', fg: '#cbd5e1' }))
        .with({ favourited: false, hovered: true }, () => ({ bg: '#db2777', fg: '#cbd5e1' }))
        .with({ favourited: true, hovered: false }, () => ({ bg: '#f472b6', fg: '#111827' }))
        .with({ favourited: true, hovered: true }, () => ({ bg: '#f9a8d4', fg: '#111827' }))
        .exhaustive();
      return (
        <button
          className='w-full p-3 text-center transition rounded hover:shadow-xl'
          style={{ background: bg, color: fg }}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Favorite{favourited ? 'd' : ''}
          {collection && ` (${favouriteCount})`}
        </button>
      );
    })
    .exhaustive();

  if (user) {
    return favouriteButton;
  } else if (!user) {
    return <YouMustBeLoggedIn>{favouriteButton}</YouMustBeLoggedIn>;
  }
}
