"use client";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export interface MoreResultsButtonProps {
  children: ReactNode;
}
export default function MoreResultsButton({
  children,
}: MoreResultsButtonProps) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setLoading(false);
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  return (
    <button
      className={
        loading
          ? "flex gap-4 justify-center items-center w-full p-3 text-center transition rounded bg-slate-700 opacity-60"
          : "w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
      }
      onClick={() => setLoading(true)}
      disabled={loading}
    >
      {children}
    </button>
  );
}
