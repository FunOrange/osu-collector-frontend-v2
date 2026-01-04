'use client';

import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { User2 } from 'lucide-react';
import { useState } from 'react';
import md5 from 'md5';
import { Input } from '@/components/shadcn/input';
import { submitOtp } from '@/services/osu-collector-api';
import { tryCatch } from '@/utils/try-catch';
import { AxiosError, AxiosResponse } from 'axios';
import { useToast } from '@/components/shadcn/use-toast';
import useSubmit from '@/hooks/useSubmit';
import { mutate } from 'swr';

export default function ElectronLogin() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [authX, setAuthX] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loginUrl, setLoginUrl] = useState('');

  const initiateOtpLogin = () => {
    setOtpInput('');
    const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
    const callback = encodeURIComponent(process.env.NEXT_PUBLIC_OSU_OAUTH_CALLBACK!);
    // @ts-expect-error
    const x = md5(Date.now());
    setAuthX(x);
    const url = `https://osu.ppy.sh/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${callback}&state=${x}`;
    setLoginUrl(url);
    window.ipc.openLinkInBrowser(url);
  };

  const [otpLogin, loading] = useSubmit(async (otp: number) => {
    const y = md5(authX);
    const [_, err] = await tryCatch<AxiosResponse, AxiosError>(submitOtp(otp, y));
    if (err) {
      if (err.response?.status === 440) {
        alert('Session expired, please try again.');
        setOpen(false);
        return;
      } else {
        console.error(err);
        alert('Something went wrong, please try again.');
        setOpen(false);
        return;
      }
    }
    toast({ title: 'Success!', description: 'You are now logged in.' });
    mutate('/users/me');
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (loading) return;
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant='important'
          size='lg'
          className='text-md h-10 w-full justify-start gap-2'
          onClick={initiateOtpLogin}
        >
          <User2 className='h-5 w-5' />
          Login
        </Button>
      </DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>One time password</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          After authenticating through the osu! website, osu!Collector should show you a one time password. Please enter
          it here to finish logging in.
        </DialogDescription>
        <div className='flex w-full justify-center'>
          <div className='relative'>
            <div className='pointer-events-none absolute z-10 flex h-full w-full justify-evenly gap-1 px-2 py-2'>
              <div className='w-full rounded bg-slate-500/20' />
              <div className='w-full rounded bg-slate-500/20' />
              <div className='w-full rounded bg-slate-500/20' />
              <div className='w-full rounded bg-slate-500/20' />
            </div>
            <Input
              disabled={loading}
              className='w-[150px] overflow-hidden py-2 pl-3 pr-0 font-mono text-4xl tracking-[0.34em]'
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value.slice(0, 4));
                if (e.target.value.match(/^\d{4}$/)) {
                  otpLogin(Number(e.target.value));
                }
              }}
            />
          </div>
        </div>
        <div>
          <div className='flex w-full gap-1 pt-2 text-xs text-muted-foreground/50'>
            Browser didn&apos;t open? Visit this url:
          </div>
          <div className='break-all text-xs text-muted-foreground/50'>{loginUrl}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
