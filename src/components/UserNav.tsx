'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { useUser } from '@/services/osu-collector-api-hooks';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import md5 from 'md5';
import { match } from 'ts-pattern';
import Link from 'next/link';
import { formatQueryParams } from '@/utils/string-utils';
import { CreditCard, Heart, Upload } from 'lucide-react';

export function UserNav() {
  const { user, morphed, morph, unmorph, isLoading, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (isLoading) {
    return <div className='w-32 h-10 p-5 rounded-full bg-slate-400 animate-pulse'></div>;
  }
  if (!user) {
    const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
    const callback = encodeURIComponent(process.env.NEXT_PUBLIC_OSU_OAUTH_CALLBACK);
    const oauthUrl = `https://osu.ppy.sh/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${callback}`;
    const otpLogin = () => {
      // @ts-expect-error
      const x = md5(Date.now());
      localStorage.setItem('authX', x);
      const oauthUrlWithOtp = `${oauthUrl}&state=${x}`;
      const newWindow = window.open(oauthUrlWithOtp, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;

      const redirectTo = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      router.push('/login/enterOtp?' + formatQueryParams({ redirectTo }));
    };
    return (
      <a
        className='flex items-center gap-2 py-1 pl-2 pr-4 font-semibold transition bg-indigo-500 rounded-lg cursor-pointer text-indigo-50 hover:bg-indigo-600'
        {...match(process.env.NODE_ENV)
          .with('production', () => ({
            href: oauthUrl,
            target: '_blank',
          }))
          .otherwise(() => ({
            onClick: otpLogin,
          }))}
      >
        <Image width={32} height={32} src='/icons/osu-32x32.png' alt='osu!' />
        <div className='hidden xl:block whitespace-nowrap'>Log in with osu!</div>
        <div className='block xl:hidden whitespace-nowrap'>Log in</div>
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative flex items-center gap-2 p-1 pr-4 transition rounded-full text-gray-50 font-semibold ${
            user.paidFeaturesAccess ? 'bg-pink-500 hover:bg-pink-400' : 'bg-slate-600 hover:bg-slate-600'
          }`}
        >
          <Avatar className='w-8 h-8'>
            <AvatarImage src={user.osuweb.avatar_url} alt='avatar' />
            <AvatarFallback>{user.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='line-clamp-1'>{user.osuweb.username}</div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount sideOffset={10}>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.osuweb.username}</p>
            <p className='text-xs leading-none text-muted-foreground'>{`https://osu.ppy.sh/users/${user.id}`}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Upload className='w-4 h-4 mr-2' />
              <span>My uploads</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <Link href={`/users/${user.id}/uploads/collections`}>
                  <DropdownMenuItem>Collections</DropdownMenuItem>
                </Link>
                <Link href={`/users/${user.id}/uploads/tournaments`}>
                  <DropdownMenuItem>Tournaments</DropdownMenuItem>
                </Link>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Heart className='w-4 h-4 mr-2' />
              <span>Favourites</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <Link href={`/users/${user.id}/favourites/collections`}>
                  <DropdownMenuItem>Collections</DropdownMenuItem>
                </Link>
                <Link href={`/users/${user.id}/favourites/tournaments`}>
                  <DropdownMenuItem>Tournaments</DropdownMenuItem>
                </Link>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <Link href='/billing'>
            <DropdownMenuItem>
              <CreditCard className='w-4 h-4 mr-2' />
              Billing
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user.id === 2051389 && !morphed && (
          <DropdownMenuItem
            onClick={async () => {
              const userId = Number(prompt('Enter userId'));
              if (userId) {
                await morph(userId);
              }
            }}
          >
            Morph
          </DropdownMenuItem>
        )}
        {morphed && <DropdownMenuItem onClick={unmorph}>Unmorph</DropdownMenuItem>}
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
