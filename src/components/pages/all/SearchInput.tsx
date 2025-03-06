'use client';
import { cn } from '@/utils/shadcn-utils';
import { formatQueryParams } from '@/utils/string-utils';
import { usePathname, useRouter } from 'next/navigation';
import { mergeRight } from 'ramda';
import { useState } from 'react';
import { Search } from 'react-bootstrap-icons';

export interface SearchInputProps {
  searchParams: { [key: string]: string | string[] | undefined };
  withIcon?: boolean;
  className?: string;
}
export default function SearchInput({ searchParams, withIcon, className }: SearchInputProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInput, setUserInput] = useState(searchParams.search as string);

  const handleEnterKey = (key: string) => {
    if (key === 'Enter') {
      router.push(
        `${pathname}?${formatQueryParams(mergeRight(searchParams, { search: userInput.trim(), cursor: undefined }))}`,
      );
    }
  };

  const input = (
    <input
      className={cn(
        'px-3 py-3 text-xl border rounded-md border-slate-900 bg-[#162032] ring-offset-background placeholder:text-muted-foreground',
        withIcon && 'pl-11',
        className,
      )}
      placeholder='Search...'
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => handleEnterKey(e.key)}
    />
  );

  if (withIcon) {
    return (
      <div className='relative'>
        <div className='absolute inset-y-0 flex items-center pointer-events-none start-0 ps-4'>
          <Search size={20} />
        </div>
        {input}
      </div>
    );
  }
  return input;
}
