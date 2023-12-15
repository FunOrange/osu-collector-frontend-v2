import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import { getRecentCollections, getUserFavourites } from "@/services/osu-collector-api";
import Link from "next/link";
import { Stars } from "react-bootstrap-icons";
import * as api from "@/services/osu-collector-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { s } from "@/utils/string-utils";

interface UserFavouritesPageProps {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function UserFavouritesPage({
  params,
  searchParams,
}: UserFavouritesPageProps) {
  const [pageUser, favouriteCollections] = await Promise.all([
    api.getUser(params.userId),
    getUserFavourites(params.userId),
  ]).catch(() => [null, null]);
  if (!pageUser) {
    return <div className="mt-16 text-3xl text-center text-red-500">No such user exists.</div>;
  }

  return (
    <div className="flex justify-center w-100">
      <div className="px-2 py-5 md:px-10 max-w-screen-2xl">
        <div className="p-4 mb-4 rounded bg-slate-800 md:p-7">
          <h1 className="flex items-center gap-4 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage src={pageUser.osuweb.avatar_url} alt="@shadcn" />
              <AvatarFallback>{pageUser.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl">{pageUser.osuweb.username}&apos;s Favourites</h1>
              <div className="text-slate-400">
                {favouriteCollections.length} collection{s(favouriteCollections.length)}
              </div>
            </div>
          </h1>
          <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!favouriteCollections ? (
              <div className="text-red-500">There was an error retrieving collections.</div>
            ) : (
              favouriteCollections.map((collection, i) => (
                <CollectionCard key={i} collection={collection} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
