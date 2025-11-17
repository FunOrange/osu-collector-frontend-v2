'use client';

import { mutate } from 'swr';
import md5 from 'md5';
import * as api from '@/services/osu-collector-api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EnterOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onOtpChanged = async (event) => {
    const inputString = event.target.value;
    if (inputString.length == 0 || inputString.length > 4) {
      return;
    }
    const otp = Number(inputString);
    if (isNaN(otp) || !otp) {
      return;
    }

    const authX = localStorage.getItem('authX');
    const y = md5(authX!);

    // Submit
    try {
      await api.submitOtp(otp, y);
      mutate('/users/me');
      if (searchParams.get('redirectTo')) {
        router.push(searchParams.get('redirectTo')!);
      } else {
        router.push('/');
      }
    } catch (error) {
      alert('OTP is probably expired, please try to log in again.');
      router.push(searchParams.get('redirectTo')!);
      return;
    }
  };

  return (
    <div className='flex items-center justify-center w-full h-[90vh]'>
      <div className='flex flex-col items-center gap-4 p-12 rounded bg-slate-700'>
        <div className='text-5xl'>One time password</div>
        <div className='text-lg'>
          After authenticating through the osu! website, osu!Collector should show you a one time password. Please enter
          it here to finish logging in.
        </div>
        <input
          type='text'
          id='simple-search'
          className='text-2xl rounded-lg block p-2.5  bg-slate-800 placeholder-slate-600 text-white focus:ring-blue-500 focus:border-blue-500 w-[100px] text-center'
          placeholder='1234'
          required
          onChange={onOtpChanged}
        />
      </div>
    </div>
  );
}
