'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/utils/string-utils';
import { Input } from '@/components/shadcn/input';
import * as api from '@/services/osu-collector-api';
import { Button } from '@/components/shadcn/button';
import Image from 'next/image';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import { useUser } from '@/services/osu-collector-api-hooks';

export interface CheckoutPageProps {}
export default function CheckoutPage({}: CheckoutPageProps) {
  const [checkoutError, setCheckoutError] = useState('');
  const [cardError, setCardError] = useState(false);
  const { user, mutate: mutateUser } = useUser();

  const router = useRouter();
  const stripe = useStripe()!;
  const elements = useElements()!;

  const handleCardDetailsChange = (ev) => {
    if (ev.error) {
      setCheckoutError(ev.error.message);
      setCardError(true);
    } else {
      setCheckoutError('');
      setCardError(false);
    }
  };

  const [processing, setProcessingTo] = useState(0);
  const handleFormSubmit = async (ev) => {
    ev.preventDefault();

    const email = ev.target[0].value;
    if (!validateEmail(email)) {
      setCheckoutError('That is not a valid email');
      setProcessingTo(0);
      return;
    }

    const cardElement = elements.getElement('card')!;

    // Create customer by sending request to backend
    setProcessingTo(1);
    const createCustomerResponse = await api.createCustomer(email);
    console.log(createCustomerResponse);

    // Create subscription by sending request to backend
    let createSubscriptionResponse;
    try {
      setProcessingTo(2);
      createSubscriptionResponse = await api.createSubscription();
    } catch (err) {
      setCheckoutError(err.message);
      setProcessingTo(0);
      return;
    }
    const clientSecret = createSubscriptionResponse.clientSecret;
    console.log(createSubscriptionResponse);

    // Collect the payment via Stripe
    setProcessingTo(3);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: email,
        },
      },
      setup_future_usage: 'off_session',
    });
    if (result.error) {
      setCheckoutError(result?.error?.message ?? 'Something went wrong. Please try again later.');
      setProcessingTo(0);
      return;
    }
    mutateUser();
    router.push('/payments/success');
  };

  const cardElementOpts: StripeCardElementOptions = {
    iconStyle: 'solid' as const,
    style: {
      base: {
        color: 'rgb(203, 213, 225)',
        backgroundColor: '#020817',
        fontSize: '14px',
        padding: '10px',
      },
    },
  };

  return (
    <div className='flex flex-col items-center justify-center gap-8 mt-8'>
      <div className='w-full max-w-xl p-4 text-center rounded shadow m-w-2xl bg-slate-700'>
        <h1 className='mb-2 text-3xl font-semibold text-slate-50'>Desktop Client Subscription</h1>
        <p>
          $1.99 per month
          <br />
          auto-renewing subscription (you may cancel at any time)
        </p>
      </div>

      <div className='w-full max-w-xl rounded shadow bg-slate-700'>
        <div className='px-5 py-4 my-4 text-center shadow-sm'>
          <h5 className='mb-4 text-lg text-slate-50'>Pay with card</h5>
          <form onSubmit={handleFormSubmit}>
            <Input type='email' placeholder='Email' />
            <div className='px-4 py-3 my-2 rounded-lg bg-slate-950'>
              <CardElement options={cardElementOpts} onChange={handleCardDetailsChange} />
            </div>
            {checkoutError && (
              <>
                <div className='p-4 mb-4 text-center text-red-200 bg-red-900 rounded'>
                  {checkoutError}
                  <br />
                  If you need help please contact funorange42@yahoo.ca
                </div>
              </>
            )}
            {/* TIP always disable your submit button while processing payments */}
            <Button type='submit' className='w-full mb-5' disabled={cardError || !stripe} loading={processing > 0}>
              Subscribe
            </Button>
          </form>
          <div className='flex justify-center'>
            <Image
              src='https://cdn.brandfolder.io/KGT2DTA4/at/rvgw5pc69nhv9wkh7rw8ckv/Powered_by_Stripe_-_blurple.svg'
              alt='Powered by Stripe'
              width={128}
              height={29}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
