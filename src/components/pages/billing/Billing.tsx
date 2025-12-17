'use client';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useToast } from '@/components/shadcn/use-toast';
import useSubmit from '@/hooks/useSubmit';
import * as api from '@/services/osu-collector-api';
import {
  useCoinbaseCharges,
  usePaypalSubscription,
  useStripeSubscription,
  useTwitchSubcription,
  useUser,
} from '@/services/osu-collector-api-hooks';
import { cn } from '@/utils/shadcn-utils';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { match } from 'ts-pattern';
import dayjs, { Dayjs } from 'dayjs';

export default function Billing() {
  const { toast } = useToast();
  const { user, isLoading: userLoading, mutate: mutateUser } = useUser();

  // #region twitch
  const { isSubbedToFunOrange, isLoading: twitchLoading } = useTwitchSubcription();
  const [unlinkTwitchAccount, unlinkingTwitchAccount] = useSubmit(async () => {
    await mutateUser(api.unlinkTwitchAccount(), { populateCache: false });
  });
  // #endregion twitch

  // #region paypal
  const {
    paypalSubscription,
    canCancelPaypalSubscription,
    paypalEndDate,
    paypalEndDateVerb,
    isLoading: paypalLoading,
    mutate: mutatePaypalSubscription,
  } = usePaypalSubscription();

  const [showCancelPaypalConfirmationModal, setShowCancelPaypalConfirmationModal] = useState(false);
  const [cancelPaypalSubscription, cancellingPaypalSubscription] = useSubmit(async () => {
    try {
      await api.cancelPaypalSubscription();
      toast({ title: 'Subscription cancelled' });
    } finally {
      mutateUser();
      mutatePaypalSubscription();
    }
    setShowCancelPaypalConfirmationModal(false);
  });
  // #endregion paypal

  // #region stripe
  const {
    stripeSubscription,
    stripeEndDate,
    stripeEndDateVerb,
    canCancelStripeSubscription,
    isLoading: stripeLoading,
    mutate: mutateStripeSubscription,
  } = useStripeSubscription();
  const stripeSubscriptionStatus =
    stripeSubscription?.status === 'active' && stripeSubscription?.cancel_at_period_end
      ? 'Active until end of billing period'
      : stripeSubscription?.status?.toUpperCase();
  const showStripePaymentMethod = Boolean(stripeSubscription?.default_payment_method?.card);

  const [showCancelStripeConfirmationModal, setShowCancelStripeConfirmationModal] = useState(false);
  const [cancelStripeSubscription, cancellingStripeSubscription] = useSubmit(async () => {
    try {
      await api.cancelStripeSubscription();
      toast({ title: 'Subscription cancelled' });
    } finally {
      mutateUser();
      mutateStripeSubscription();
    }
    setShowCancelStripeConfirmationModal(false);
  });
  // #endregion stripe

  const { coinbaseCharges, isLoading: coinbaseChargesLoading } = useCoinbaseCharges();
  const coinbaseActiveUntil = (() => {
    if (!user || !coinbaseCharges) return undefined;

    let coinbaseActiveUntil: Dayjs | undefined;
    for (const coinbaseCharge of coinbaseCharges) {
      const datePaid = dayjs(coinbaseCharge.date_paid);
      if (coinbaseActiveUntil === undefined || datePaid.isAfter(coinbaseActiveUntil)) {
        coinbaseActiveUntil = datePaid;
      }
      coinbaseActiveUntil = coinbaseActiveUntil.add(1, 'month');
    }
    return coinbaseActiveUntil;
  })();
  const coinbaseSubscriptionIsActive = Boolean(coinbaseActiveUntil?.isAfter(dayjs()));

  return (
    <div className='mb-16 mt-8 flex w-full justify-center'>
      <div className='flex flex-col gap-10'>
        <div>
          <div className='mb-1 text-lg text-white'>Billing</div>
          <div className='text-sm'>
            For inquiries please message FunOrange in the{' '}
            <a href='https://discord.gg/WZMQjwF5Vr' className='text-blue-500 hover:underline'>
              osu!Collector discord
            </a>
            . Alternatively you can send an email to{' '}
            <a href='mailto:funorange@osucollector.com' className='text-blue-500 hover:underline'>
              funorange@osucollector.com
            </a>
            .
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='w-full max-w-screen-lg'>
            <h1 className='text-2xl'>PayPal</h1>
          </div>

          <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
            <div className='border-b border-slate-600'>
              <div className='flex items-center justify-between px-5 py-3'>
                <div className='text-lg'>Current Plan</div>
                <div className='flex gap-3'>
                  {!paypalLoading && (
                    <>
                      {canCancelPaypalSubscription && (
                        <Dialog
                          open={showCancelPaypalConfirmationModal}
                          onOpenChange={(open) => setShowCancelPaypalConfirmationModal(open)}
                        >
                          <DialogTrigger asChild>
                            <Button size='sm' variant='destructive' className='h-7'>
                              Cancel subscription
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmation</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                              Are you sure you would like to cancel your subscription?
                            </DialogDescription>
                            <div className='flex items-center gap-2'>
                              <DialogClose>
                                <Button variant='outline'>Cancel</Button>
                              </DialogClose>
                              <Button
                                variant='destructive'
                                onClick={cancelPaypalSubscription}
                                loading={cancellingPaypalSubscription}
                              >
                                Confirm
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {user && !user?.paidFeaturesAccess && (
                        <Button size='sm' variant='important' className='h-7 bg-cyan-600 font-bold text-white' asChild>
                          <Link href='/client#option-2-credit-card'>Subscribe</Link>
                        </Button>
                      )}
                      {!user && (
                        <YouMustBeLoggedIn>
                          <Button size='sm' variant='important' className='h-7 bg-cyan-600 font-bold text-white'>
                            Subscribe
                          </Button>
                        </YouMustBeLoggedIn>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className='px-5 py-6'>
              <div className='grid grid-cols-3 gap-x-4 gap-y-5'>
                <Skeleton loading={paypalLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>PAYPAL EMAIL</div>
                    <div className='text-lg'>{paypalSubscription?.subscriber?.email_address || '-'}</div>
                  </div>
                </Skeleton>
                <div />
                <div />
                <Skeleton loading={paypalLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>STATUS</div>
                    <div className='text-lg'>{paypalSubscription?.status?.toUpperCase() || '-'}</div>
                  </div>
                </Skeleton>
                <Skeleton loading={paypalLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>BILLING CYCLE</div>
                    <div className='text-lg'>
                      {paypalSubscription?.status?.toLowerCase() === 'active' ? 'Monthly' : '-'}
                    </div>
                  </div>
                </Skeleton>
                <Skeleton loading={paypalLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>PLAN COST</div>
                    <div className='text-lg'>
                      {paypalSubscription?.status?.toLowerCase() === 'active' ? '$1.99 USD' : '-'}
                    </div>
                  </div>
                </Skeleton>
                <Skeleton loading={paypalLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>REFERENCE #</div>
                    <div className='text-lg'>{paypalSubscription?.id || '-'}</div>
                  </div>
                </Skeleton>
                <Skeleton loading={paypalLoading}>
                  {paypalSubscription && (
                    <div>
                      <div className='mb-1 text-xs text-slate-400'>CREATED ON</div>
                      <div className='text-lg'>
                        {paypalSubscription?.create_time
                          ? moment(paypalSubscription.create_time).format('MMMM Do, YYYY')
                          : '-'}
                      </div>
                    </div>
                  )}
                </Skeleton>
                <Skeleton loading={paypalLoading}>
                  {paypalSubscription && (
                    <div>
                      <div className='mb-1 text-xs uppercase text-slate-400'>{paypalEndDateVerb} ON</div>
                      <div className='text-lg'>
                        {paypalEndDate ? moment(paypalEndDate).format('MMMM Do, YYYY') : '-'}
                      </div>
                    </div>
                  )}
                </Skeleton>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='w-full max-w-screen-lg'>
            <h1 className='text-2xl'>Credit Card</h1>
          </div>

          <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
            <div className='border-b border-slate-600'>
              <div className='flex items-center justify-between px-5 py-3'>
                <div className='text-lg'>Current Plan</div>
                <div className='flex gap-3'>
                  {!stripeLoading && (
                    <>
                      {canCancelStripeSubscription && (
                        <Dialog
                          open={showCancelStripeConfirmationModal}
                          onOpenChange={(open) => setShowCancelStripeConfirmationModal(open)}
                        >
                          <DialogTrigger asChild>
                            <Button size='sm' variant='destructive' className='h-7'>
                              Cancel subscription
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmation</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                              Are you sure you would like to cancel your subscription?
                            </DialogDescription>
                            <div className='flex items-center gap-2'>
                              <DialogClose>
                                <Button variant='outline'>Cancel</Button>
                              </DialogClose>
                              <Button
                                variant='destructive'
                                onClick={cancelStripeSubscription}
                                loading={cancellingStripeSubscription}
                              >
                                Confirm
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {user && !user?.paidFeaturesAccess && (
                        <Button size='sm' variant='important' className='h-7 bg-cyan-600 font-bold text-white' asChild>
                          <Link href='/payments/checkout'>Subscribe</Link>
                        </Button>
                      )}
                      {!user && (
                        <YouMustBeLoggedIn>
                          <Button size='sm' variant='important' className='h-7 bg-cyan-600 font-bold text-white'>
                            Subscribe
                          </Button>
                        </YouMustBeLoggedIn>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className='px-5 py-6'>
              <div className='grid grid-cols-3 gap-x-4 gap-y-5'>
                <Skeleton loading={stripeLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>STATUS</div>
                    <div className='text-lg'>{stripeSubscriptionStatus || '-'}</div>
                  </div>
                </Skeleton>
                <Skeleton loading={stripeLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>BILLING CYCLE</div>
                    <div className='text-lg'>
                      {stripeSubscription?.status === 'active' && !stripeSubscription?.cancel_at_period_end
                        ? 'Monthly'
                        : '-'}
                    </div>
                  </div>
                </Skeleton>
                <Skeleton loading={stripeLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>PLAN COST</div>
                    <div className='text-lg'>{stripeSubscription?.status === 'active' ? '$1.99 USD' : '-'}</div>
                  </div>
                </Skeleton>
                <Skeleton loading={stripeLoading}>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>REFERENCE #</div>
                    <div className='text-lg'>{stripeSubscription?.id || '-'}</div>
                  </div>
                </Skeleton>
                <Skeleton loading={stripeLoading}>
                  {stripeSubscription && (
                    <div>
                      <div className='mb-1 text-xs text-slate-400'>CREATED ON</div>
                      <div className='text-lg'>{moment.unix(stripeSubscription.created).format('MMMM Do, YYYY')}</div>
                    </div>
                  )}
                </Skeleton>
                <Skeleton loading={stripeLoading}>
                  {stripeSubscription && (
                    <div>
                      <div className='mb-1 text-xs uppercase text-slate-400'>{stripeEndDateVerb} ON</div>
                      <div className='text-lg'>
                        {stripeEndDate ? moment(stripeEndDate).format('MMMM Do, YYYY') : '-'}
                      </div>
                    </div>
                  )}
                </Skeleton>
              </div>
            </div>
          </div>
          {showStripePaymentMethod && (
            <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
              <div className='border-b border-slate-600'>
                <div className='px-5 py-3 text-lg'>Payment Method</div>
              </div>
              <div className='flex w-full justify-between p-5'>
                <div className='flex items-start gap-3'>
                  {(() => {
                    const { brand, display_brand, last4, exp_month, exp_year } =
                      stripeSubscription?.default_payment_method?.card ?? {};
                    const src = match(brand)
                      .with('visa', () => '/icons/credit-cards/visa.png')
                      .with('mastercard', () => '/icons/credit-cards/mastercard.png')
                      .with('amex', () => '/icons/credit-cards/amex.png')
                      .with('discover', () => '/icons/credit-cards/discover.png')
                      .with('diners', () => '/icons/credit-cards/diners.png')
                      .with('jcb', () => '/icons/credit-cards/jcb.png')
                      .otherwise(() => undefined);
                    const withoutLast4 = match(brand)
                      .with('amex', () => '**** ****** *')
                      .otherwise(() => '**** **** **** ');
                    return (
                      <div className='flex items-start gap-3'>
                        {src && <Image src={src} alt={brand ?? 'unknown'} width={64} height={40} />}
                        <div>
                          {!src && <div>{display_brand}</div>}
                          <div>
                            {withoutLast4}
                            {last4}
                          </div>
                          <div className='text-xs text-slate-400'>
                            Expiry on {exp_month}/{exp_year}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className='ml-6'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size='sm'>Change</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Notice</DialogTitle>
                      <DialogDescription>
                        If you&apos;d like to change your payment method, please cancel your subscription, then create a
                        new subscription with the new payment method after the old subscription ends.
                      </DialogDescription>
                      <DialogClose>
                        <Button variant='outline'>Ok</Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <div className='w-full max-w-screen-lg'>
            <h1 className='text-2xl'>Crypto</h1>
          </div>
          <div>
            Crypto payments are one-time and non-recurring. Each payment extends the active subscription period by one
            month.
          </div>
          {coinbaseActiveUntil?.isAfter(dayjs()) && (
            <div className='rounded-md border border-green-400 bg-green-500/20 px-4 py-2 text-sm text-green-400'>
              Your crypto subscription is active until {coinbaseActiveUntil.format('MMM DD, YYYY')}
            </div>
          )}
          {coinbaseActiveUntil?.isBefore(dayjs()) && (
            <div className='rounded-md border border-gray-400 bg-gray-500/20 px-4 py-2 text-sm text-gray-400'>
              Your crypto subscription was active until {coinbaseActiveUntil.format('MMM DD, YYYY')}
            </div>
          )}
          <div className='relative overflow-x-auto rounded-md border border-slate-700 bg-slate-900 shadow-sm'>
            <Skeleton loading={!user || coinbaseChargesLoading}>
              <table className='w-full text-left text-sm text-slate-300 rtl:text-right'>
                <thead className='rounded-md border-b border-slate-700 bg-slate-800 text-sm text-slate-200'>
                  <tr>
                    <th scope='col' className='px-6 py-3 font-medium'>
                      Transaction Date
                    </th>
                    <th scope='col' className='px-6 py-3 font-medium'>
                      Status
                    </th>
                    <th scope='col' className='px-6 py-3 font-medium'>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {!!coinbaseCharges?.length ? (
                    coinbaseCharges.map((coinbaseCharge) => (
                      <tr key={coinbaseCharge.id} className='border-b border-slate-600 last:border-b-0'>
                        <th scope='row' className='whitespace-nowrap px-6 py-4 font-medium text-slate-100'>
                          {dayjs(coinbaseCharge.date_paid).format('MMM DD, YYYY [at] h:mm A')}
                        </th>
                        <td className='flex px-6 py-4'>
                          <div className='rounded-sm bg-green-500 px-2 py-[2px] text-xs text-white'>Paid</div>
                        </td>
                        <td className='px-6 py-4 font-medium'>1.99 USDC</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className='px-8 py-4 text-slate-600'>
                        <Skeleton>No transactions</Skeleton>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Skeleton>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='w-full max-w-screen-lg'>
            <h1 className='text-2xl text-slate-400'>
              Twitch Sub <span className='text-red-400'> - DEPRECATED</span>
            </h1>
            <div className='mb-1 text-sm text-slate-400'>
              An osu!Collector subscription can be obtained by subbing to FunOrange on Twitch. Existing Twitch Prime
              users can use a <span className='text-white'>prime sub</span> for no additional cost.
            </div>
            <div className='text-sm text-white'>
              NOTE: This subscription method has stopped working as of April 1st, 2025.
            </div>
          </div>

          <div className='flex gap-16 rounded border-slate-900 bg-[#162032] px-5 py-6 shadow-inner'>
            <Skeleton loading={twitchLoading}>
              <div>
                <div className='mb-1 text-xs text-slate-400'>TWITCH ACCOUNT</div>
                {!user && (
                  <Button size='sm' disabled className='h-7 bg-cyan-600 font-bold text-white'>
                    Link Twitch account
                  </Button>
                )}
                {user && !user?.private?.linkedTwitchAccount && (
                  <Button
                    size='sm'
                    variant='important'
                    className={cn('h-7', !user?.paidFeaturesAccess ? 'bg-cyan-600 font-bold text-white' : '')}
                    disabled
                    asChild
                  >
                    <span>Link Twitch Account</span>
                  </Button>
                )}
                {user?.private?.linkedTwitchAccount && (
                  <div className='flex'>
                    <Button size='sm' className='h-8 w-full rounded-r-none bg-background' variant='outline' disabled>
                      {user.private.linkedTwitchAccount.displayName}
                    </Button>
                    <Button
                      size='sm'
                      className='h-8 rounded-l-none bg-background'
                      variant='outline'
                      onClick={unlinkTwitchAccount}
                      loading={unlinkingTwitchAccount}
                    >
                      Unlink
                    </Button>
                  </div>
                )}
              </div>
            </Skeleton>
            <Skeleton loading={twitchLoading}>
              <div>
                <div className='mb-1 text-xs text-slate-400'>STATUS</div>
                {user?.private?.twitchError && Boolean(user?.private?.linkedTwitchAccount) ? (
                  <div className='text-red-400'>Please unlink your Twitch account and try again.</div>
                ) : !user?.private?.linkedTwitchAccount ? (
                  <div className='text-slate-500'>Twitch account not linked</div>
                ) : !isSubbedToFunOrange ? (
                  <div className='text-slate-500'>Not subbed to FunOrange</div>
                ) : isSubbedToFunOrange ? (
                  <div className='rounded bg-green-600 px-3 py-1 text-sm font-semibold text-slate-50'>Subbed</div>
                ) : undefined}
              </div>
            </Skeleton>
            <div />
          </div>
        </div>

        {/* TODO: need to keep record of old paypalSubscriptionIds and stripeSubscriptionIds */}
        {/* <div className="flex flex-col gap-6">
          <div className="w-full max-w-screen-lg">
            <h1 className="text-2xl">Transactions</h1>
            <div className="text-sm text-slate-400">
              All successful PayPal/credit card payments made through osu!Collector are shown below.
              <br />
              For users who have subscribed through Twitch, please refer to your Twitch dashboard
              for payment history.
            </div>
          </div>

          <div>
            <div className="grid flex-col grid-cols-3 px-5 mb-4 text-sm text-slate-500">
              <div>Date</div>
              <div>Payment Method</div>
              <div>Amount (USD)</div>
            </div>
            <div className="flex flex-col gap-1">
              {new Array(10).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 px-5 py-3 transition-colors rounded border-slate-900 shadow-inner bg-[#162032] hover:bg-slate-700"
                >
                  <div>3/9/2024</div>
                  <div>PayPal - funorange42@yahoo.ca</div>
                  <div>$1.99</div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
