import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import { Search } from "react-bootstrap-icons";
import { formatQueryParams } from "@/utils/string-utils";
import { mergeRight } from "ramda";
import { cn } from "@/utils/shadcn-utils";
import { isMatching } from "ts-pattern";
import SearchInput from "@/components/pages/all/SearchInput";

interface CollectionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { collections, hasMore, nextPageCursor, results } = await api.searchCollections({
    search: searchParams.search ?? "",
    cursor: searchParams.cursor,
    sortBy: searchParams.sortBy ?? "_text_match",
    orderBy: searchParams.orderBy ?? "desc",
    perPage: 48,
  });

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col items-center gap-6 px-2 py-5 md:px-10 max-w-screen-2xl">
        <div className="flex flex-col items-center gap-3">
          <SearchInput searchParams={searchParams} />
          <div className="flex gap-2 text-2xl">
            <Search className="mt-1" />
            {results} results
          </div>
        </div>
        <div className="p-4 mb-4 rounded bg-slate-800 md:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              searchParams.search
                ? { label: "Relevance", sortBy: "_text_match", orderBy: "desc" }
                : undefined,
              { label: "Popular", sortBy: "favourites", orderBy: "desc" },
              { label: "Newest", sortBy: "dateUploaded", orderBy: "desc" },
              { label: "Oldest", sortBy: "dateUploaded", orderBy: "asc" },
              { label: "osu!std", sortBy: "osuCount", orderBy: "desc" },
              { label: "taiko", sortBy: "taikoCount", orderBy: "desc" },
              { label: "mania", sortBy: "maniaCount", orderBy: "desc" },
              { label: "ctb", sortBy: "catchCount", orderBy: "desc" },
            ]
              .filter(Boolean)
              .map(({ label, sortBy, orderBy }, i) => (
                <Link
                  key={i}
                  href={`/all?${formatQueryParams(mergeRight(searchParams, { sortBy, orderBy }))}`}
                  className={cn(
                    "px-3 py-1 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-700",
                    isMatching({ sortBy, orderBy })(searchParams)
                      ? "text-indigo-200 bg-indigo-800 opacity-90 pointer-events-none border-indigo-800"
                      : undefined
                  )}
                >
                  {label}
                </Link>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4 mb-5 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!collections ? (
              <div className="text-red-500">There was an error retrieving collections.</div>
            ) : (
              collections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
          {hasMore ? (
            <Link
              href={`/all?${formatQueryParams(
                mergeRight(searchParams, { cursor: nextPageCursor })
              )}`}
            >
              <MoreResultsButton>More results</MoreResultsButton>
            </Link>
          ) : (
            <div className="text-center text-slate-400">Reached end of results</div>
          )}
        </div>
      </div>
    </div>
  );
}
