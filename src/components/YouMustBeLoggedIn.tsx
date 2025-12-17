'use client';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { match } from 'ts-pattern';
import md5 from 'md5';
import { formatQueryParams } from '@/utils/string-utils';
import { Button } from '@/components/shadcn/button';
import Image from 'next/image';
import { useUser } from '@/services/osu-collector-api-hooks';

export interface YouMustBeLoggedInProps {
  children: ReactNode;
}
export default function YouMustBeLoggedIn({ children }: YouMustBeLoggedInProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
  const callback = encodeURIComponent(process.env.NEXT_PUBLIC_OSU_OAUTH_CALLBACK!);
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

  const [open, setOpen] = useState(false);
  if (user) {
    return children;
  } else if (!user) {
    return (
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {children}
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>You must be logged in to do that</DialogTitle>
          </DialogHeader>
          <div className='flex gap-4'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <a
              className='flex cursor-pointer items-center gap-2 rounded bg-indigo-500 py-1 pl-2 pr-4 font-semibold text-indigo-50 transition hover:bg-indigo-600'
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
              <div className='whitespace-nowrap'>Log in with osu!</div>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
