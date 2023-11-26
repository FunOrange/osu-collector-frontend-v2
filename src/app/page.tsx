import CollectionCard from "@/components/CollectionCard";
import {
  getMetadata,
  getPopularCollections,
  getRecentCollections,
} from "@/services/osu-collector-api";
import Link from "next/link";
import { Discord, Fire, Stars } from "react-bootstrap-icons";

export default async function Home() {
  const metadata = await getMetadata();
  const popularCollections = await getPopularCollections({
    range: "week",
    perPage: 9,
  }).then((data) => data.collections);
  const recentCollections = await getRecentCollections({ perPage: 9 }).then(
    (data) => data.collections
  );

  return (
    <div className="flex justify-center w-100">
      <div className="px-10 py-5 max-w-screen-2xl">
        <div className="p-4 mb-4 text-center rounded bg-sky-900 text-sky-200">
          <Discord className="inline mb-1 mr-2" size={20} />
          Join the{" "}
          <a href="https://discord.gg/WZMQjwF5Vr" className="text-blue-500">
            osu!Collector discord
          </a>
          ! Feel free to message FunOrange about any issues you have or
          suggestions for the site.
        </div>

        <div className="items-center justify-between gap-6 mb-4 md:flex">
          <div className="my-2">
            <h1 className="text-3xl">Welcome to osu!Collector!</h1>
            <p>
              This is a place where you can view beatmap collections uploaded by
              other players. It is mainly developed by{" "}
              <a
                href="https://twitter.com/funorange42"
                className="text-blue-500"
              >
                FunOrange
              </a>{" "}
              and{" "}
              <a href="https://twitter.com/mahloola" className="text-blue-500">
                mahloola
              </a>
              . &nbsp;If you like the project, consider supporting us to get
              access to{" "}
              <Link href="/client" className="text-blue-500">
                extra features
              </Link>
              .
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-3">
            <div className="px-6 py-3 rounded bg-slate-800">
              <div className="text-xl">
                {metadata.userCount.toLocaleString()}
              </div>
              <div className="text-sm whitespace-nowrap">Total users</div>
            </div>

            <div className="px-6 py-3 rounded bg-slate-800">
              <div className="text-xl">
                {metadata.totalCollections.toLocaleString()}
              </div>
              <div className="text-sm whitespace-nowrap">Total collections</div>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded text-slate-100 bg-slate-800 p-7">
          <h2 className="mb-6 text-3xl">
            <Fire className="inline mb-2 mr-3 text-orange-400" size={32} />
            Popular this week
          </h2>
          <div className="grid grid-cols-1 gap-8 mb-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!popularCollections ? (
              <div className="text-red-500">
                There was an error retrieving collections.
              </div>
            ) : (
              <>
                {popularCollections.map((collection, i) => (
                  <CollectionCard key={i} collection={collection} />
                ))}
              </>
            )}
          </div>
          <Link href="/popular?range=week">
            <div className="p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600 w-100">
              See all popular this week
            </div>
          </Link>
        </div>

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
              <>
                {recentCollections.map((collection, i) => (
                  <CollectionCard key={i} collection={collection} />
                ))}
              </>
            )}
          </div>
          <Link href="/popular?range=week">
            <div className="p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600 w-100">
              See all recent
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
