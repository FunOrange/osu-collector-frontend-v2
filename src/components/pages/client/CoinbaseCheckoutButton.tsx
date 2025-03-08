'use client';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { api } from '@/services/osu-collector-api';
import { useUser } from '@/services/osu-collector-api-hooks';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import { useRouter } from 'next/navigation';

export default function CoinbaseCheckoutButton() {
  const { mutate: mutateUser } = useUser();
  const router = useRouter();
  const buttonStyle =
    'transition-all mt-0 py-6 w-full bg-black text-white coinbase-button hover:scale-105 hover:bg-gray-900';

  return (
    <YouMustBeLoggedIn>
      <Checkout
        chargeHandler={async () => {
          const charge = await api.post('/payments/coinbase/charge').then((res) => res.data);
          return charge.id;
        }}
        onStatus={async (status) => {
          if (status.statusName === 'success') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await mutateUser();
            router.push('/payments/success');
          }
        }}
      >
        <CheckoutButton icon='coinbasePay' className={buttonStyle} text='Pay with Crypto Wallet' />
        <CheckoutStatus />
      </Checkout>
    </YouMustBeLoggedIn>
  );
}
