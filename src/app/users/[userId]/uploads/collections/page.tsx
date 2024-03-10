import CollectionCard from "@/components/CollectionCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import * as api from "@/services/osu-collector-api";
import { s } from "@/utils/string-utils";

interface PageProps {
  params: { userId: string };
}
export default async function UserUploadedCollectionsPage({ params }: PageProps) {
  const [pageUser, uploads] = await Promise.all([
    api.getUser(params.userId),
    api.getUserUploads(params.userId),
  ]).catch(() => [null, null]);
  if (!pageUser) {
    return <div className="mt-16 text-3xl text-center text-red-500">No such user exists.</div>;
  }
  const collections = uploads?.collections;

  return (
    <div className="flex justify-center w-full">
      <div className="px-2 py-5 md:px-10 max-w-screen-2xl">
        <div className="p-4 mb-4 rounded bg-slate-700 md:p-7">
          <h2 className="flex items-center gap-3 mb-6">
            <Avatar className="w-10 h-10">
              <AvatarImage src={pageUser.osuweb.avatar_url} alt="@shadcn" />
              <AvatarFallback>{pageUser.osuweb.username[0].toLocaleUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mb-0 text-2xl">{pageUser.osuweb.username}</h1>
              <a
                className="block text-xs leading-none transition-colors text-muted-foreground hover:text-blue-500"
                href={`https://osu.ppy.sh/users/${pageUser.id}`}
              >
                {`https://osu.ppy.sh/users/${pageUser.id}`}
              </a>
            </div>
          </h2>
          <h1 className="mb-2 text-2xl">
            {collections.length} uploaded collection{s(collections.length)}
          </h1>
          <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!collections ? (
              <div className="text-red-500">There was an error retrieving collections.</div>
            ) : (
              collections.map((collection, i) => <CollectionCard key={i} collection={collection} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
