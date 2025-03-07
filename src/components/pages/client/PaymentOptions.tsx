'use client';
import { Twitch } from 'react-bootstrap-icons';
import * as api from '@/services/osu-collector-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  usePaypalSubscription,
  useStripeSubscription,
  useTwitchSubcription,
  useUser,
} from '@/services/osu-collector-api-hooks';
import useSubmit from '@/hooks/useSubmit';
import { Button } from '@/components/shadcn/button';
import { match } from 'ts-pattern';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import Link from 'next/link';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';

const isPaypalOrStripeSubscriptionActive = (user, paypalSubscription, stripeSubscription) => {
  if (user?.private?.subscriptionExpiryDate) {
    const subscriptionExpiryDate = new Date(user.private.subscriptionExpiryDate._seconds * 1000);
    if (subscriptionExpiryDate > new Date()) {
      return true;
    }
  }
  if (paypalSubscription?.status.toLowerCase() === 'active') {
    return true;
  }
  if (stripeSubscription?.status.toLowerCase() === 'active') {
    return true;
  }
  return false;
};

export interface PaymentOptionsProps {}
export default function PaymentOptions({}: PaymentOptionsProps) {
  const router = useRouter();
  const { user, mutate: mutateUser } = useUser();

  const { isSubbedToFunOrange, mutate: mutateTwitchSubcription } = useTwitchSubcription();
  const { paypalSubscription, mutate: mutatePaypalSubscription } = usePaypalSubscription();
  const { stripeSubscription, mutate: mutateStripeSubscription } = useStripeSubscription();

  const [paypalError, setPaypalError] = useState(null);

  // Unlink Twitch
  const [unlinkTwitchAccount, unlinkingTwitchAccount] = useSubmit(async () => {
    await mutateUser(api.unlinkTwitchAccount(), { populateCache: false });
  });

  const paypalOrStripeSubscriptionActive = isPaypalOrStripeSubscriptionActive(
    user,
    paypalSubscription,
    stripeSubscription,
  );

  return (
    <PayPalScriptProvider
      options={{
        'client-id': 'AeUARmSkIalUe4gK08KWZjWYJqSq0AKH8iS9cQ3U8nIGiOxyUmrPTPD91vvE2xkVovu-3GlO0K7ISv2R',
        vault: true,
        intent: 'subscription',
        components: 'buttons',
      }}
    >
      <div className='w-full'>
        <div className='p-6 rounded-t bg-slate-600' style={{ minHeight: '286px' }}>
          <div className='mb-5 text-xl'>$1.99 monthly subscription</div>
          <div className='flex flex-col gap-3'>
            <section id='option-2-paypal'>
              {user ? (
                <div
                  className='relative z-0'
                  style={{ height: '46px', pointerEvents: paypalOrStripeSubscriptionActive ? 'none' : 'auto' }}
                >
                  <PayPalButtons
                    style={{
                      shape: 'rect',
                      color: 'gold',
                      height: 46,
                      layout: 'vertical',
                    }}
                    disabled={paypalOrStripeSubscriptionActive}
                    fundingSource='paypal'
                    createSubscription={(data, actions) => {
                      return actions.subscription.create({
                        plan_id: 'P-5DC05698WC351562JMGZFV6Y', // production: $1.99 per month
                        // plan_id: 'P-1YN01180390590643MGZNV3Y' // test: $0.05 per day
                      });
                    }}
                    // eslint-disable-next-line no-unused-vars
                    onApprove={async (data, actions) => {
                      await api.linkPaypalSubscription(data.subscriptionID);
                      mutateUser();
                      router.push('/payments/success');
                    }}
                    onError={(error) => {
                      console.error(error);
                      setPaypalError(error);
                    }}
                  />
                </div>
              ) : (
                <YouMustBeLoggedIn>
                  <div className='cursor-pointer'>
                    <div className='relative z-0 pointer-events-none' style={{ height: '46px' }}>
                      <PayPalButtons
                        style={{ shape: 'rect', color: 'gold', height: 46, layout: 'vertical' }}
                        fundingSource='paypal'
                      />
                    </div>
                  </div>
                </YouMustBeLoggedIn>
              )}
            </section>

            <div className='flex items-center my-2'>
              <div className='w-full border-b border-slate-400' />
              <span className='mx-3 text-center text-slate-400 min-w-[140px]'>Or pay with card</span>
              <div className='w-full border-b border-slate-400' />
            </div>

            <section id='option-2-credit-card'>
              {user ? (
                <Link href='/payments/checkout'>
                  <Button
                    variant='important'
                    className='w-full py-6 text-lg bg-cyan-700'
                    disabled={paypalOrStripeSubscriptionActive}
                  >
                    Pay with credit card
                  </Button>
                </Link>
              ) : (
                <YouMustBeLoggedIn>
                  <Button variant='important' className='w-full py-6 text-lg bg-cyan-700'>
                    Pay with credit card
                  </Button>
                </YouMustBeLoggedIn>
              )}
            </section>

            <div className='flex items-center my-2'>
              <div className='w-full border-b border-slate-400' />
              <span className='mx-3 text-center text-slate-400 min-w-[140px]'>Or pay with crypto</span>
              <div className='w-full border-b border-slate-400' />
            </div>

            <section id='option-3-crypto'>
              <Checkout productId='5f86255d-bfe4-41b0-978a-3fe1a41dae98'>
                <CheckoutButton coinbaseBranded />
                <CheckoutStatus />
              </Checkout>
            </section>
          </div>
        </div>
        <div className='flex items-center gap-3 px-4 py-3 rounded-b bg-slate-900'>
          <div className='font-semibold text-slate-50'>Current status:</div>
          {isPaypalOrStripeSubscriptionActive(user, paypalSubscription, stripeSubscription) ? (
            <div className='px-3 py-1 text-sm font-semibold bg-green-600 rounded text-slate-50'>Active</div>
          ) : (
            <div className='text-slate-500'>Not active</div>
          )}
          {(user?.private?.paypalSubscriptionId || user?.private?.stripeSubscriptionId) && (
            <Link href='/billing'>
              <Button size='sm' variant='outline'>
                Show details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
