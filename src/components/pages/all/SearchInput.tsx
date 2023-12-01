"use client";
import { formatQueryParams } from "@/utils/string-utils";
import { useRouter } from "next/navigation";
import { mergeRight } from "ramda";
import { useState } from "react";

export default function SearchInput({ searchParams }) {
  const router = useRouter();
  const [userInput, setUserInput] = useState(searchParams.search);
  return (
    <input
      className="px-3 py-2 text-2xl text-center border rounded-md border-slate-700 bg-slate-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground"
      placeholder="Search..."
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          router.push(
            `/all?${formatQueryParams(
              mergeRight(searchParams, { search: userInput.trim(), cursor: undefined })
            )}`
          );
        }
      }}
    />
  );
}
