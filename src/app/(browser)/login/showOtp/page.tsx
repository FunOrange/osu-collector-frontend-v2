export default async function EnterOtpPage(props) {
  const searchParams = await props.searchParams;
  const otp = searchParams.otp as string;

  return (
    <div className='flex h-[90vh] w-full items-center justify-center'>
      <div className='flex flex-col items-center gap-4 rounded bg-slate-700 p-12'>
        <div className='text-xl'>Your one time password is:</div>
        <div className='text-5xl'>{otp.padStart(4, '0')}</div>
        <div className='text text-slate-400'>Please enter this code in the desktop app to login</div>
      </div>
    </div>
  );
}
