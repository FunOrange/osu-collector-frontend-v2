'use client';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export interface MoreResultsButtonProps {
  children: ReactNode;
}
export default function MoreResultsButton({ children }: MoreResultsButtonProps) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setLoading(false);
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  return (
    <button
      className={
        loading
          ? 'flex w-full items-center justify-center gap-4 rounded bg-slate-800 p-3 text-center opacity-60 transition'
          : 'w-full rounded bg-slate-800 p-3 text-center transition hover:bg-slate-600 hover:shadow-xl'
      }
      onClick={() => setLoading(true)}
      disabled={loading}
    >
      {children}
    </button>
  );
}
