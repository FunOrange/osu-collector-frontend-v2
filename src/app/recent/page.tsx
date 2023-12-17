import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import { getRecentCollections } from "@/services/osu-collector-api";
import Link from "next/link";
import { Stars } from "react-bootstrap-icons";

interface RecentPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function RecentPage({ searchParams }: RecentPageProps) {
  const recent = await getRecentCollections({
    cursor: searchParams.cursor,
    perPage: 48,
  });
  const { collections: recentCollections, hasMore, nextPageCursor } = recent;

  return (
    <div className="flex justify-center w-full">
      <div className="px-2 py-5 md:px-10 max-w-screen-2xl">
        <div className="mb-4 rounded bg-slate-800 p-4 md:p-7">
          <h1 className="mb-6 text-3xl">
            <Stars className="inline mb-1 mr-3 text-yellow-400" size={24} />
            Recent collections
          </h1>
          <div className="grid grid-cols-1 gap-4 mb-5 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!recentCollections ? (
              <div className="text-red-500">There was an error retrieving collections.</div>
            ) : (
              recentCollections.map((collection, i) => (
                <CollectionCard key={i} collection={collection} />
              ))
            )}
          </div>
          {hasMore ? (
            <Link href={`/recent?cursor=${nextPageCursor}`}>
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
