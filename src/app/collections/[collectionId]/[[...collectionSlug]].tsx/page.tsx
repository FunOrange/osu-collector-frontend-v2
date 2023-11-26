import moment from "moment";
import BarGraph from "@/components/BarGraph";
import ModeCounters from "@/components/ModeCounters";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import Image from "next/image";
import { getUrlSlug } from "@/utils/string-utils";
import { bpmToColor, starToColor } from "@/utils/theme-utils";
import FavouriteButton from "@/components/FavouriteButton";
import {
  CaretDownFill,
  CaretUpFill,
  ChatFill,
  SortUp,
} from "react-bootstrap-icons";
import { identity } from "ramda";
import { match } from "ts-pattern";
import { groupBeatmapsets } from "@/entities/Beatmap";
import BeatmapsetCard from "@/components/BeatmapsetCard";

interface CollectionPageProps {
  params: { collectionId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const collection = await api.getCollection(params.collectionId);

  const graphHeight = 160;

  const sortBy = match(searchParams.sortBy)
    .with("beatmapset.artist", identity)
    .with("beatmapset.title", identity)
    .with("beatmapset.creator", identity)
    .with("difficulty_rating", identity)
    .with("bpm", identity)
    .with("hit_length", identity)
    .otherwise(() => "beatmapset.artist");
  const orderBy: "asc" | "desc" = match(searchParams.orderBy)
    .with("asc", identity)
    .with("desc", identity)
    .otherwise(() => "asc");

  const { beatmaps } = await api.getCollectionBeatmaps({
    collectionId: collection.id,
    perPage: 24,
  });
  const listing = groupBeatmapsets(beatmaps);

  return (
    <div className="flex justify-center w-100">
      <div className="flex flex-col px-10 py-5 gap-7 max-w-screen-2xl">
        <div className="p-4 rounded bg-slate-800">
          <div className="grid mb-4 lg:grid-cols-2 xs:grid-cols-1">
            <BarGraph
              title="difficulty spread"
              data={{
                x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                  (star) => collection.difficultySpread?.[star] ?? 0
                ),
                barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) =>
                  starToColor(star, true)
                ),
              }}
              height={graphHeight}
            />
            <div className="hidden sm:block">
              <BarGraph
                title="bpm spread"
                data={{
                  x: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260,
                    270, 280, 290, 300,
                  ],
                  y: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260,
                    270, 280, 290, 300,
                  ].map((bpm) => collection.bpmSpread?.[bpm] ?? 0),
                  barColors: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260,
                    270, 280, 290, 300,
                  ].map((bpm) => bpmToColor(bpm, true)),
                }}
                height={graphHeight}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl">{collection.name}</h1>
          <div className="grid grid-cols-2">
            <div>
              <div className="mb-2">
                <ModeCounters collection={collection} />
              </div>
              <small className="text-slate-400">
                Uploaded{" "}
                {moment.unix(collection.dateUploaded._seconds).fromNow()}
              </small>{" "}
              <div
                className="grid items-start w-full gap-4 pt-4 pr-4"
                style={{ gridTemplateColumns: "auto 1fr" }}
              >
                <div className="flex items-center justify-start px-2 py-1 transition rounded-lg cursor-pointer hover:bg-slate-900">
                  <Image
                    className="mr-2 rounded-full"
                    src={`https://a.ppy.sh/${collection.uploader.id}`}
                    width={32}
                    height={32}
                    alt={"Collection uploader avatar"}
                  />
                  <div className="flex flex-col">
                    <div className="text-sm whitespace-nowrap">
                      {collection.uploader.username}
                    </div>
                    {collection.uploader.rank > 0 && (
                      <small className="text-xs text-slate-500">
                        #{collection.uploader.rank}
                      </small>
                    )}
                  </div>
                </div>
                <div
                  className="p-4 rounded bg-slate-700"
                  style={{ minHeight: "88px" }}
                >
                  {collection.description ? (
                    <div>{collection.description}</div>
                  ) : (
                    <div className="text-sm text-slate-500">No description</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-4 border-l border-slate-700">
              <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
                Download maps
              </button>
              <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
                Add to osu
              </button>
              <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
                Favorite
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 text-center rounded cursor-pointer text-slate-500 bg-slate-800 hover:bg-slate-700">
          <ChatFill size={20} />
          No comments. Be the first to leave a comment!
        </div>

        <div className="flex flex-col gap-6 p-4 rounded bg-slate-800">
          <div className="flex items-center gap-6">
            <div>Sort by:</div>
            <div className="flex gap-2">
              {[
                ["beatmapset.artist", "Artist"],
                ["beatmapset.title", "Title"],
                ["beatmapset.creator", "Mapper"],
                ["difficulty_rating", "Stars"],
                ["bpm", "BPM"],
                ["hit_length", "Length"],
              ].map(([value, label], i) => {
                if (value === sortBy) {
                  return (
                    <Link
                      key={i}
                      href={`/collections/${collection.id}/${getUrlSlug(
                        collection.name
                      )}?${api.formatQueryParams({
                        sortBy: value,
                        orderBy: match(orderBy)
                          .with("asc", () => "desc")
                          .with("desc", () => "asc")
                          .exhaustive(),
                      })}`}
                    >
                      <button
                        className="flex items-center gap-2 px-3 py-1 text-indigo-200 bg-indigo-800 border-gray-600 rounded opacity-90"
                        disabled
                      >
                        {match(orderBy)
                          .with("asc", () => <CaretUpFill />)
                          .with("desc", () => <CaretDownFill />)
                          .exhaustive()}
                        {label}
                      </button>
                    </Link>
                  );
                } else {
                  return (
                    <Link
                      key={i}
                      href={`/collections/${collection.id}/${getUrlSlug(
                        collection.name
                      )}?${api.formatQueryParams({
                        sortBy: value,
                        orderBy: match(value)
                          .with("beatmapset.artist", () => "asc")
                          .with("beatmapset.title", () => "asc")
                          .with("beatmapset.creator", () => "asc")
                          .otherwise(() => "desc"),
                      })}`}
                    >
                      <button className="flex items-center gap-2 px-3 py-1 transition border border-gray-600 rounded cursor-pointer hover:bg-slate-500 text-slate-400">
                        {label}
                      </button>
                    </Link>
                  );
                }
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {listing.map(({ beatmapset, beatmaps }, index) => (
              <BeatmapsetCard
                key={index}
                beatmapset={beatmapset}
                beatmaps={beatmaps}
                // playing={currentlyPlaying === index}
                // onPlayClick={() => onPlayClick(index)}
                // onAudioEnd={onAudioEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
