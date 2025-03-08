import { Button } from '@/components/shadcn/button';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import useSubmit from '@/hooks/useSubmit';
import { api } from '@/services/osu-collector-api';

export default function CoinbaseCheckoutButton() {
  const buttonStyle =
    'flex items-center gap-1 transition-all mt-0 py-6 w-full bg-black text-white coinbase-button hover:scale-105 hover:bg-gray-900';

  const [createCharge, creatingCharge] = useSubmit(async () => {
    const charge = await api.post('/payments/coinbase/charge').then((res) => res.data);
    window.location.href = charge.hosted_url;
  });

  return (
    <YouMustBeLoggedIn>
      <Button className={buttonStyle} loading={creatingCharge} onClick={createCharge}>
        <svg width='24' height='24' viewBox='0 -1 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            fill-rule='evenodd'
            clip-rule='evenodd'
            d='M10.0145 14.1666C7.82346 14.1666 6.04878 12.302 6.04878 9.99996C6.04878 7.69788 7.82346 5.83329 10.0145 5.83329C11.9776 5.83329 13.6069 7.33677 13.9208 9.30552H17.9163C17.5793 5.02774 14.172 1.66663 10.0145 1.66663C5.63568 1.66663 2.08301 5.39926 2.08301 9.99996C2.08301 14.6007 5.63568 18.3333 10.0145 18.3333C14.172 18.3333 17.5793 14.9722 17.9163 10.6944H13.9208C13.6069 12.6632 11.9776 14.1666 10.0145 14.1666Z'
            fill='#f9fafb'
          />
        </svg>
        Pay with Crypto Wallet
      </Button>
    </YouMustBeLoggedIn>
  );
}
