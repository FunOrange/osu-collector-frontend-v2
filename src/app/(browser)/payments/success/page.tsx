'use client';
import { Button } from '@/components/shadcn/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export interface SuccessPageProps {}
export default function SuccessPage({}: SuccessPageProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div className='flex h-[calc(100vh-56px)] w-full items-center justify-center text-center'>
      <div>
        <h1 className='mb-5 text-4xl'>Success!</h1>
        <Link href='/client#download-links'>
          <Button variant='important'>Click here to go to the download page</Button>
        </Link>
        <div className='opacity-60'>{isClient && <Confetti />}</div>
      </div>
    </div>
  );
}
