import OtpInput from '@/app/(browser)/login/enterOtp/OtpInput';
import { Suspense } from 'react';

export default function EnterOtpPage() {
  return (
    <div className='flex h-[90vh] w-full items-center justify-center'>
      <div className='flex flex-col items-center gap-4 rounded bg-slate-700 p-12'>
        <div className='text-5xl'>One time password</div>
        <div className='text-lg'>
          After authenticating through the osu! website, osu!Collector should show you a one time password. Please enter
          it here to finish logging in.
        </div>
        <Suspense>
          <OtpInput />
        </Suspense>
      </div>
    </div>
  );
}
