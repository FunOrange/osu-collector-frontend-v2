import { ChatFill } from 'react-bootstrap-icons';

export default function Loading() {
  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col px-2 py-5 md:px-10 gap-7 w-full max-w-screen-xl'>
        <div className='rounded border-slate-900 shadow-inner bg-[#162032]'>
          <div className='flex flex-col gap-4 p-4'>
            <div className='flex flex-col xl:flex-row justify-between items-center gap-2'>
              <div className='h-[48px]' />
              <div className='h-[40px]' />
            </div>
            <div className='grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center justify-start px-2 py-1 transition rounded-lg first-letter:items-center '>
                    <div className='h-8 w-8 rounded-full bg-slate-900' />
                  </div>
                  <small className='text-slate-400'>Uploaded</small>
                </div>
                <div className='w-full pt-4 pr-4'>
                  <div className='p-4 rounded bg-slate-800' style={{ minHeight: '106px' }} />
                </div>
              </div>
              <div className='flex flex-col justify-end gap-2'>
                <div className='w-full p-3 text-center transition rounded bg-slate-600 '>Download maps</div>
                <div className='w-full p-3 text-center transition rounded rounded-r-none bg-slate-600'>Add to osu!</div>
                <div className='w-full p-3 text-center transition rounded bg-[#475569] color-[#cbd5e1]'>Favorite</div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid rounded-t lg:grid-cols-2 xs:grid-cols-1 gap-4'>
          <div className='flex flex-col gap-2 p-4 bg-slate-950 rounded-lg'>
            <div className='flex flex-col md:flex-row md:justify-between items-start'>
              <div className='font-semibold text-white text-[20px]'>Star Rating</div>
            </div>
            <div className='h-[160px]' />
          </div>
          <div className='flex flex-col gap-2 p-4 bg-slate-950 rounded-lg'>
            <div className='flex flex-col md:flex-row md:justify-between items-start'>
              <div className='font-semibold text-white text-[20px]'>BPM</div>
            </div>
            <div className='h-[160px]' />
          </div>
        </div>

        <div className='flex items-center justify-center gap-2 p-4 text-center rounded text-slate-500 border-slate-900 shadow-inner bg-[#162032] '>
          <ChatFill size={20} />
          No comments. Be the first to leave a comment!
        </div>

        <div className='flex flex-col gap-6 p-4 rounded border-slate-900 shadow-inner bg-[#162032] min-h-screen' />
      </div>
    </div>
  );
}
