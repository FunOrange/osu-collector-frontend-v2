import { ChatFill } from 'react-bootstrap-icons';

export default function Loading() {
  return (
    <div className='flex w-full justify-center'>
      <div className='flex w-full max-w-screen-xl flex-col gap-7 px-2 py-5 md:px-10'>
        <div className='rounded border-slate-900 bg-[#162032] shadow-inner'>
          <div className='flex flex-col gap-4 p-4'>
            <div className='flex flex-col items-center justify-between gap-2 xl:flex-row'>
              <div className='h-[48px]' />
              <div className='h-[40px]' />
            </div>
            <div className='grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center justify-start rounded-lg px-2 py-1 transition first-letter:items-center'>
                    <div className='h-8 w-8 rounded-full bg-slate-900' />
                  </div>
                  <small className='text-slate-400'>Uploaded</small>
                </div>
                <div className='w-full pr-4 pt-4'>
                  <div className='rounded bg-slate-800 p-4' style={{ minHeight: '106px' }} />
                </div>
              </div>
              <div className='flex flex-col justify-end gap-2'>
                <div className='w-full rounded bg-slate-600 p-3 text-center transition'>Download maps</div>
                <div className='w-full rounded rounded-r-none bg-slate-600 p-3 text-center transition'>Add to osu!</div>
                <div className='color-[#cbd5e1] w-full rounded bg-[#475569] p-3 text-center transition'>Favorite</div>
              </div>
            </div>
          </div>
        </div>

        <div className='xs:grid-cols-1 grid gap-4 rounded-t lg:grid-cols-2'>
          <div className='flex flex-col gap-2 rounded-lg bg-slate-950 p-4'>
            <div className='flex flex-col items-start md:flex-row md:justify-between'>
              <div className='text-[20px] font-semibold text-white'>Star Rating</div>
            </div>
            <div className='h-[160px]' />
          </div>
          <div className='flex flex-col gap-2 rounded-lg bg-slate-950 p-4'>
            <div className='flex flex-col items-start md:flex-row md:justify-between'>
              <div className='text-[20px] font-semibold text-white'>BPM</div>
            </div>
            <div className='h-[160px]' />
          </div>
        </div>

        <div className='flex items-center justify-center gap-2 rounded border-slate-900 bg-[#162032] p-4 text-center text-slate-500 shadow-inner'>
          <ChatFill size={20} />
          No comments. Be the first to leave a comment!
        </div>

        <div className='flex min-h-screen flex-col gap-6 rounded border-slate-900 bg-[#162032] p-4 shadow-inner' />
      </div>
    </div>
  );
}
