'use client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover';
import { cn } from '@/utils/shadcn-utils';
import { formatQueryParams } from '@/utils/string-utils';
import Link from 'next/link';
import { mergeRight } from 'ramda';
import { useState } from 'react';
import { ChevronDown } from 'react-bootstrap-icons';

const rankRanges = [
  { label: 'Any', uploaderRankMin: undefined, uploaderRankMax: undefined },
  { label: 'Top 1K', uploaderRankMin: '1', uploaderRankMax: '1000' },
  { label: '1K - 10K', uploaderRankMin: '1001', uploaderRankMax: '10000' },
  { label: '10K - 100K', uploaderRankMin: '10001', uploaderRankMax: '100000' },
  { label: '100K+', uploaderRankMin: '100001', uploaderRankMax: undefined },
];

export interface UploaderRankFilterProps {
  searchParams: { [key: string]: string | undefined };
}
export default function UploaderRankFilter({ searchParams }: UploaderRankFilterProps) {
  const [open, setOpen] = useState(false);
  const isFiltered = Boolean(searchParams.uploaderRankMin || searchParams.uploaderRankMax);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-3 py-1 text-center transition hover:bg-slate-600 hover:shadow-xl',
          isFiltered ? 'border-indigo-800 bg-indigo-800 text-indigo-200 opacity-90' : undefined,
        )}
      >
        Uploader Rank
        <ChevronDown className='h-3 w-3' color='currentColor' />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto min-w-[10rem] border-slate-700 bg-slate-900 p-1'>
        <div className='flex flex-col'>
          {rankRanges.map(({ label, uploaderRankMin, uploaderRankMax }, i) => (
            <Link
              key={i}
              href={`/all?${formatQueryParams(mergeRight(searchParams, { uploaderRankMin, uploaderRankMax, cursor: undefined }))}`}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded px-3 py-1.5 transition hover:bg-slate-600',
                searchParams.uploaderRankMin === uploaderRankMin && searchParams.uploaderRankMax === uploaderRankMax
                  ? 'pointer-events-none bg-indigo-800 text-indigo-200 opacity-90'
                  : undefined,
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
