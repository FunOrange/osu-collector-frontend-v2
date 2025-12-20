'use client';
import { mutate } from 'swr';
import md5 from 'md5';
import * as api from '@/services/osu-collector-api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OtpInput() {
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
    <input
      type='text'
      id='simple-search'
      className='block w-[100px] rounded-lg bg-slate-800 p-2.5 text-center text-2xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500'
      placeholder='1234'
      required
      onChange={onOtpChanged}
    />
  );
}
