'use client';
import ImageWithFallback from '@/components/universal/ImageWithFallback';
import Link from 'next/link';
import Image from 'next/image';
import { OsuCollectorUser } from '@/entities/OsuCollectorUser';
import { cn } from '@/utils/shadcn-utils';
import Flags from 'country-flag-icons/react/3x2';
import { s } from '@/utils/string-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import { InfoCircle } from 'react-bootstrap-icons';

export interface UserCardProps {
  user: OsuCollectorUser;
}
function UserCard({ user }: UserCardProps) {
  const pfp = `https://a.ppy.sh/${user.id}`;
  const banner = user.osuweb.cover.url;
  const chipStyle =
    'border bg-opacity-40 hover:brightness-125 shadow-inner text-white text-xs font-medium px-2.5 py-0.5 rounded-full';
  const Flag = Flags[user.osuweb.country_code.toUpperCase()];

  return (
    <TooltipProvider>
      <div className='relative bg-slate-800 rounded-3xl overflow-hidden hover:brightness-110 transition-all'>
        <ImageWithFallback
          src={banner}
          fallbackSrc='/images/slimcoverfallback.jpg'
          fill
          sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (min-width: 1024px) 472px'
          alt='User profile banner'
          className='w-full h-full object-cover absolute brightness-30'
        />
        <div className='absolute w-full h-full brightness-30 bg-slate-700 opacity-70' />

        <div className='relative h-full p-4 grid grid-cols-[96px_1fr] gap-x-4 z-10'>
          <div className='self-center'>
            <Image src={pfp} width={96} height={96} alt='User profile picture' className='rounded-full' />
          </div>

          <div className='w-full flex flex-col items-start'>
            <div className='w-full flex justify-between'>
              <a href={`https://osu.ppy.sh/users/${user.id}`} className='text-xl text-white hover:text-blue-300'>
                {user.osuweb.username}
              </a>
              <Flag style={{ height: '1.25rem' }} />
            </div>
            <Tooltip>
              <TooltipTrigger>
                <div className='text-sm'>Global #{user.osuweb.statistics.global_rank}</div>
              </TooltipTrigger>
              <TooltipContent className='flex gap-1 items-center'>
                <InfoCircle />
                At time of last login
              </TooltipContent>
            </Tooltip>
            <div className='text-sm'>Country #{user.osuweb.statistics.country_rank}</div>
            <div className='flex flex-wrap gap-2 mt-2'>
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
