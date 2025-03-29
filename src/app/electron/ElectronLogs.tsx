import { Channel } from '@/app/electron/ipc-types';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/utils/shadcn-utils';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';

export default function ElectronLogs() {
  const { data, isLoading } = useSWR(window.ipc && Channel.GetLogs, window.ipc?.getLogs, { refreshInterval: 500 });
  const path = data?.path;
  const lines = data?.lines ?? [];
  const lineColors = (() => {
    const lineColors: string[] = [];
    let color: string | undefined;
    for (const line of lines) {
      if (line.match(/^\[\d+-\d+-\d+ \d+:\d+:\d+.\d+\] \[info\] /)) {
        color = 'text-blue-300';
      } else if (line.match(/^\[\d+-\d+-\d+ \d+:\d+:\d+.\d+\] \[error\] /)) {
        color = 'text-red-400';
      } else if (line.match(/^\[\d+-\d+-\d+ \d+:\d+:\d+.\d+\] \[warn\] /)) {
        color = 'text-yellow-200';
      }
      lineColors.push(color);
    }
    return lineColors;
  })();

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isLoading) {
      ref.current?.scrollTo(0, ref.current.scrollHeight);
    }
  }, [isLoading]);

  return (
    <div className='p-4'>
      <Button
        size='sm'
        variant='link'
        className='text-white mb-1'
        onClick={() => window.ipc.revealPath(path.replace(/[^\\/]+$/, ''))}
      >
        {path}
      </Button>
      <div
        ref={ref}
        className='p-2 bg-slate-950 font-mono text-xs whitespace-pre-line min-h-20 max-h-[calc(100vh-140px)] overflow-y-auto'
      >
        {lines?.map((line, i) => (
          <div key={i} className={cn(lineColors[i])}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
