'use client';
import { ReactNode, useEffect, useState } from 'react';

export interface MoreResultsButtonProps {
  searchParams: Record<string, string | undefined>;
  children: ReactNode;
}
export default function MoreResultsButton({ searchParams, children }: MoreResultsButtonProps) {
  const [loading, setLoading] = useState(false);
  useEffect(() => setLoading(false), [searchParams]);
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
