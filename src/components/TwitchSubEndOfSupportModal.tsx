'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { useUser } from '@/services/osu-collector-api-hooks';

export default function TwitchSubEndOfSupportModal() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('twitch-sub-end-of-support-modal-shown');
    if (user?.private?.linkedTwitchAccount?.id && alreadyShown !== 'true') {
      setOpen(true);
    }
  }, [user?.private?.linkedTwitchAccount?.id]);

  const onConfirm = () => {
    localStorage.setItem('twitch-sub-end-of-support-modal-shown', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Dear Beloved Twitch Subscriber,</DialogTitle>
        </DialogHeader>
        <p>
          Thank you for your support. Unfortunately,{' '}
          <b className='text-red-400'>we are ending support for Twitch subscriptions starting April.</b>
        </p>
        <p>
          The reason for this is that 6 months ago, Twitch suspended all payouts for my channel for some unexplained
          reason. I have tried for months to contact them, but I was only able to receive this automated response:
        </p>
        <div className='px-4 py-3 text-slate-400 bg-slate-800 rounded'>
          One or more transactions associated with your account were flagged as fraudulent. Specifically, your account
          was flagged as having received subscriptions from accounts abusing the Prime trial offer. We cannot reinstate
          this portion of the payout. Moreover, our fraud team is continuing to monitor your account for suspicious
          activity. If and when the team clears your account, you will continue receiving authorized revenue to which
          you are entitled.
        </div>
        <p>I&apos;ve given up on waiting for another update from them. Thus I&apos;m ending support for Twitch subs.</p>
        <p>
          If you have subscribed via Twitch recently, your subscription will still be in effect until the start of
          April.
        </p>
        <p>- FunOrange</p>
        <DialogFooter>
          <Button variant='important' onClick={onConfirm}>
            I understand, do not show again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
