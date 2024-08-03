'use client';
import { formatQueryParams } from '@/utils/string-utils';
import { usePathname, useRouter } from 'next/navigation';
import { mergeRight } from 'ramda';
import { useState } from 'react';
import { Search } from 'react-bootstrap-icons';

export interface SearchInputProps {
  searchParams: { [key: string]: string | string[] | undefined };
  withIcon?: boolean;
}
export default function SearchInput({ searchParams, withIcon }: SearchInputProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInput, setUserInput] = useState(searchParams.search as string);
  if (withIcon) {
    return (
      <div className='relative'>
        <div className='absolute inset-y-0 flex items-center pointer-events-none start-0 ps-4'>
          <Search size={20} />
        </div>
        <input
          className='px-3 py-3 text-xl border rounded-md pl-11 border-slate-900 bg-[#162032] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground'
          placeholder='Search tournaments...'
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(
                `${pathname}?${formatQueryParams(
                  mergeRight(searchParams, { search: userInput.trim(), cursor: undefined }),
                )}`,
              );
            }
          }}
        />
      </div>
    );
  }
  return (
    <input
      className='px-3 py-2 text-2xl text-center border rounded-md border-slate-900 bg-[#162032] shadow-inner ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground'
      placeholder='Search...'
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          router.push(
            `${pathname}?${formatQueryParams(
              mergeRight(searchParams, { search: userInput.trim(), cursor: undefined }),
            )}`,
          );
        }
      }}
    />
  );
}
