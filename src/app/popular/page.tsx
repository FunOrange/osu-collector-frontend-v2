import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import { getPopularCollections } from "@/services/osu-collector-api";
import Link from "next/link";
import { Fire } from "react-bootstrap-icons";
import { match } from "ts-pattern";
import { identity } from "ramda";
import { formatQueryParams } from "@/utils/string-utils";

interface PopularPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function PopularPage({
  params,
  searchParams,
}: PopularPageProps) {
  const activeRange = match(searchParams.range)
    .with("today", () => "today")
    .with("week", () => "week")
    .with("month", () => "month")
    .with("year", () => "year")
    .with("alltime", () => "alltime")
    .otherwise(() => "week");
  const popular = await getPopularCollections({
    range: activeRange,
    cursor: searchParams.cursor,
    perPage: 48,
  });
  const { collections: popularCollections, hasMore, nextPageCursor } = popular;

  return (
    <div className="flex justify-center w-100">
      <div className="px-10 py-5 max-w-screen-2xl">
        <div className="mb-4 rounded bg-slate-800 p-7">
          <div
            className="flex items-center justify-between gap-2 mb-6"
            style={{ maxWidth: "740px" }}
          >
            <h1 className="mt-2 text-3xl">
              <Fire className="inline mb-2 mr-3 text-orange-400" size={32} />
              Popular collections
            </h1>
            <div className="flex items-center gap-2">
              {["today", "week", "month", "year", "alltime"].map((range, i) => {
                const label = match(range)
                  .with("alltime", () => "all time")
                  .otherwise(identity);
                if (range === activeRange) {
                  return (
                    <button
                      key={i}
                      className="px-3 py-1 border-gray-600 rounded bg-rose-800 text-rose-300 opacity-90"
                      disabled
                    >
                      {label}
                    </button>
                  );
                } else {
                  return (
                    <Link key={i} href={`/popular?range=${range}`}>
                      <button className="px-3 py-1 transition border border-gray-600 rounded cursor-pointer hover:bg-slate-500 text-slate-200">
                        {label}
                      </button>
                    </Link>
                  );
                }
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 mb-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!popularCollections ? (
              <div className="text-red-500">
                There was an error retrieving collections.
              </div>
            ) : (
              popularCollections.map((collection, i) => (
                <CollectionCard key={i} collection={collection} />
              ))
            )}
          </div>
          {hasMore ? (
            <Link
              href={`/popular?${formatQueryParams({
                range: activeRange,
                cursor: nextPageCursor,
              })}`}
            >
              <MoreResultsButton>More results</MoreResultsButton>
            </Link>
          ) : (
            <div className="text-center text-slate-400">
              Reached end of results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
