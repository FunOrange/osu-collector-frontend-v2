export default function EnterOtpPage({ searchParams }) {
  const otp = searchParams.otp;

  return (
    <div className='flex items-center justify-center w-full h-[90vh]'>
      <div className='flex flex-col items-center gap-4 p-12 rounded bg-slate-700'>
        <div className='text-xl'>Your one time password is:</div>
        <div className='text-5xl'>{otp}</div>
        <div className='text text-slate-400'>Please enter this code in the desktop app to login</div>
      </div>
    </div>
  );
}
