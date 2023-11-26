import moment from "moment";
import BarGraph from "@/components/BarGraph";
import ModeCounters from "@/components/ModeCounters";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import Image from "next/image";
import { getUrlSlug } from "@/utils/string-utils";
import { starToColor } from "@/utils/theme-utils";
import FavouriteButton from "@/components/FavouriteButton";

function CollectionCard({ collection }) {
  if (!collection) return <div></div>;

  const relativeDate = moment.unix(collection.dateUploaded._seconds).fromNow();

  // const favourited = user?.favourites?.includes(collection?.id);
  // const heartClicked = () => {
  //   const newFavourited = !favourited;
  //   if (newFavourited) {
  //     api.favouriteCollection(collection.id);
  //   } else {
  //     api.unfavouriteCollection(collection.id);
  //   }
  //   setUser({
  //     ...user,
  //     favourites: newFavourited
  //       ? [...user.favourites, collection.id]
  //       : user.favourites.filter((id) => id !== collection.id),
  //   });
  // };

  const difficultySpread = collection.difficultySpread ?? {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  };

  const href = `/collections/${collection.id}/${getUrlSlug(collection.name)}`;

  return (
    <div className="flex flex-col h-full overflow-hidden transition rounded-lg shadow-lg bg-slate-700 hover:shadow-2xl">
      <Link href={href} className="overflow-hidden">
        {/* Difficulty Spread Graph */}
        <BarGraph
          title="difficulty spread"
          data={{
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
              (star) => difficultySpread[star]
            ),
            barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) =>
              starToColor(star, true)
            ),
          }}
          height={100}
        />
      </Link>
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <ModeCounters collection={collection} />
          <FavouriteButton collection={collection} />
        </div>
      </div>
      <Link href={href} className="flex-grow p-4">
        <div className="text-lg truncate">{collection.name}</div>
        {collection.description ? (
          <div className="text-sm line-clamp-3">{collection.description}</div>
        ) : (
          <small className="text-slate-500">
            <i>no description</i>
          </small>
        )}
      </Link>
      <Link href={href} className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center justify-start">
          <Image
            className="mr-2 rounded-full"
            src={`https://a.ppy.sh/${collection.uploader.id}`}
            width={32}
            height={32}
            alt={"Collection uploader avatar"}
          />
          <div className="text-sm whitespace-nowrap">
            {collection.uploader.username}
          </div>
          {/* <Link href={`/users/${collection.uploader.id}/uploads`}>
              {collection.uploader.username}
            </Link> */}
          {collection.uploader.rank > 0 && (
            <small className="ml-1 text-slate-500">
              #{collection.uploader.rank}
            </small>
          )}
        </div>
        <small className="truncate text-slate-400">{relativeDate}</small>
      </Link>
    </div>
  );
}

export default CollectionCard;
