'use client';
import ImageWithFallback from '@/components/universal/ImageWithFallback';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/shared/entities/v1/User';
import { cn } from '@/utils/shadcn-utils';
import * as Flags from 'country-flag-icons/react/3x2';
import { s } from '@/utils/string-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import { InfoCircle } from 'react-bootstrap-icons';

export interface UserCardProps {
  user: User;
}
function UserCard({ user }: UserCardProps) {
  const pfp = `https://a.ppy.sh/${user.id}`;
  const banner = user.osuweb.cover.url;
  const chipStyle =
    'border bg-opacity-40 hover:brightness-125 shadow-inner text-white text-xs font-medium px-2.5 py-0.5 rounded-full';
  const Flag = Flags[user.osuweb.country_code.toUpperCase()];

  return (
    <TooltipProvider>
      <div className='relative overflow-hidden rounded-3xl bg-slate-800 transition-all hover:brightness-110'>
        <ImageWithFallback
          src={banner}
          fallbackSrc='/images/slimcoverfallback.jpg'
          fill
          sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (min-width: 1024px) 472px'
          alt='User profile banner'
          className='brightness-30 absolute h-full w-full object-cover'
        />
        <div className='brightness-30 absolute h-full w-full bg-slate-700 opacity-70' />

        <div className='relative z-10 grid h-full grid-cols-[96px_1fr] gap-x-4 p-4'>
          <div className='self-center'>
            <Image src={pfp} width={96} height={96} alt='User profile picture' className='rounded-full' />
          </div>

          <div className='flex w-full flex-col items-start'>
            <div className='flex w-full justify-between'>
              <a href={`https://osu.ppy.sh/users/${user.id}`} className='text-xl text-white hover:text-blue-300'>
                {user.osuweb.username}
              </a>
              <Flag style={{ height: '1.25rem' }} />
            </div>
            <Tooltip>
              <TooltipTrigger>
                <div className='text-sm'>Global #{user.osuweb.statistics.global_rank}</div>
              </TooltipTrigger>
              <TooltipContent className='flex items-center gap-1'>
                <InfoCircle />
                At time of last login
              </TooltipContent>
            </Tooltip>
            <div className='text-sm'>Country #{user.osuweb.statistics.country_rank}</div>
            <div className='mt-2 flex flex-wrap gap-2'>
              {user.uploads?.length > 0 && (
                <Link
                  href={`/users/${user.id}/uploads/collections`}
                  className={cn(chipStyle, 'border-blue-700 bg-blue-700')}
                >
                  {user.uploads?.length} upload{s(user.uploads?.length)}
                </Link>
              )}
              {user.favourites?.length > 0 && (
                <Link
                  href={`/users/${user.id}/favourites/collections`}
                  className={cn(chipStyle, 'border-red-700 bg-red-700')}
                >
                  {user.favourites?.length} favourite{s(user.favourites?.length)}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default UserCard;
