import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import { getRecentCollections } from "@/services/osu-collector-api";
import Link from "next/link";
import { Stars } from "react-bootstrap-icons";

interface RecentPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function RecentPage({
  params,
  searchParams,
}: RecentPageProps) {
  const recentCollections = await getRecentCollections({
    cursor: searchParams.cursor,
    perPage: 48,
  }).then((data) => data.collections);

  return (
    <div className="flex justify-center w-100">
      <div className="px-10 py-5 max-w-screen-2xl">
        <div className="mb-4 rounded text-slate-100 bg-slate-800 p-7">
          <h2 className="mb-6 text-3xl">
            <Stars className="inline mb-1 mr-3 text-yellow-400" size={24} />
            Recently Uploaded
          </h2>
          <div className="grid grid-cols-1 gap-8 mb-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!recentCollections ? (
              <div className="text-red-500">
                There was an error retrieving collections.
              </div>
            ) : (
              recentCollections.map((collection, i) => (
                <CollectionCard key={i} collection={collection} />
              ))
            )}
          </div>
          <Link
            href={`/recent?cursor=${
              recentCollections[recentCollections.length - 1].id
            }`}
          >
            <MoreResultsButton>More results</MoreResultsButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
