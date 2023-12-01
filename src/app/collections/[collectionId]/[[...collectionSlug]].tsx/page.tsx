import moment from "moment";
import BarGraph from "@/components/BarGraph";
import ModeCounters from "@/components/ModeCounters";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import Image from "next/image";
import { formatQueryParams, getUrlSlug } from "@/utils/string-utils";
import { bpmToColor, starToColor } from "@/utils/theme-utils";
import { ChatFill } from "react-bootstrap-icons";
import { identity, mergeRight } from "ramda";
import { Pattern, match } from "ts-pattern";
import { groupBeatmapsets } from "@/entities/Beatmap";
import BeatmapsetCard from "@/components/BeatmapsetCard";
import { cn } from "@/utils/shadcn-utils";
import FavouriteButton from "@/components/FavouriteButton";

interface CollectionPageProps {
  params: { collectionId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const collection = await api.getCollection(params.collectionId);

  const graphHeight = 160;

  const searchParamsSortBy = match(searchParams.sortBy)
    .with("beatmapset.artist", identity)
    .with("beatmapset.title", identity)
    .with("beatmapset.creator", identity)
    .with("difficulty_rating", identity)
    .with("bpm", identity)
    .with("hit_length", identity)
    .otherwise(() => undefined);
  const searchParamsOrderBy: "asc" | "desc" = match(searchParams.orderBy)
    .with("asc", identity)
    .with("desc", identity)
    .otherwise(() => undefined);
  const { orderBy, sortBy } = match({ searchParamsSortBy, searchParamsOrderBy })
    .with({ searchParamsSortBy: Pattern.string, searchParamsOrderBy: Pattern.string }, () => ({
      sortBy: searchParamsSortBy,
      orderBy: searchParamsOrderBy,
    }))
    .otherwise(() => ({
      sortBy: "beatmap.artist",
      orderBy: "desc",
    }));
  const { beatmaps, hasMore, nextPageCursor } = await api.getCollectionBeatmaps({
    collectionId: collection.id,
    cursor: searchParams.cursor,
    orderBy,
    sortBy,
    perPage: 24,
  });
  const listing = groupBeatmapsets(beatmaps);

  const pathname = `/collections/${collection.id}/${getUrlSlug(collection.name)}`;

  return (
    <div className="flex justify-center w-100">
      <div className="flex flex-col px-2 py-5 md:px-10 gap-7 max-w-screen-2xl">
        <div className="p-4 rounded bg-slate-800">
          <div className="grid mb-4 lg:grid-cols-2 xs:grid-cols-1">
            <BarGraph
              title="difficulty spread"
              data={{
                x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                  (star) => collection.difficultySpread?.[star] ?? 0
                ),
                barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => starToColor(star, true)),
              }}
              height={graphHeight}
            />
            <div className="hidden sm:block">
              <BarGraph
                title="bpm spread"
                data={{
                  x: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
                  ],
                  y: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
                  ].map((bpm) => collection.bpmSpread?.[bpm] ?? 0),
                  barColors: [
                    150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
                  ].map((bpm) => bpmToColor(bpm, true)),
                }}
                height={graphHeight}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl">{collection.name}</h1>
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <div>
              <div className="mb-2">
                <ModeCounters collection={collection} />
              </div>
              <small className="text-slate-400">
                Uploaded {moment.unix(collection.dateUploaded._seconds).fromNow()}
              </small>{" "}
              <div
                className="grid items-start w-full gap-4 pt-4 pr-4"
                style={{ gridTemplateColumns: "auto 1fr" }}
              >
                <div className="flex justify-start px-2 py-1 mt-1 transition rounded-lg cursor-pointer first-letter:items-center hover:bg-slate-900">
                  <Image
                    className="mr-2 rounded-full"
                    src={`https://a.ppy.sh/${collection.uploader.id}`}
                    width={32}
                    height={32}
                    alt={"Collection uploader avatar"}
                  />
                  <div className="flex flex-col">
                    <div className="text-sm whitespace-nowrap">{collection.uploader.username}</div>
                    {collection.uploader.rank > 0 && (
                      <small className="text-xs text-slate-500">#{collection.uploader.rank}</small>
                    )}
                  </div>
                </div>
                {collection.description ? (
                  <div
                    className="px-3 py-2 whitespace-pre-wrap rounded bg-slate-700"
                    style={{ minHeight: "88px" }}
                  >
                    <div>{collection.description}</div>
                  </div>
                ) : (
                  <div className="p-4 rounded bg-slate-700" style={{ minHeight: "88px" }}>
                    <div className="text-sm text-slate-500">No description</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2 pl-4 border-l border-slate-700">
              <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
                Download maps
              </button>
              <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
                Add to osu
              </button>
              <FavouriteButton collection={collection} variant="fullWidth" />
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
                {
                  labelDefault: "Artist",
                  labelAsc: "Artist: A-Z",
                  labelDesc: "Artist: Z-A",
                  sortKey: "beatmapset.artist",
                  defaultOrderBy: "asc",
                },
                {
                  labelDefault: "Title",
                  labelAsc: "Title: A-Z",
                  labelDesc: "Title: Z-A",
                  sortKey: "beatmapset.title",
                  defaultOrderBy: "asc",
                },
                {
                  labelDefault: "Mapper",
                  labelAsc: "Mapper: A-Z",
                  labelDesc: "Mapper: Z-A",
                  sortKey: "beatmapset.creator",
                  defaultOrderBy: "asc",
                },
                {
                  labelDefault: "Stars",
                  labelAsc: "Stars: lowest",
                  labelDesc: "Stars: highest",
                  sortKey: "difficulty_rating",
                  defaultOrderBy: "desc",
                },
                {
                  labelDefault: "BPM",
                  labelAsc: "BPM: lowest",
                  labelDesc: "BPM: highest",
                  sortKey: "bpm",
                  defaultOrderBy: "desc",
                },
                {
                  labelDefault: "Length",
                  labelAsc: "Length: shortest",
                  labelDesc: "Length: longest",
                  sortKey: "hit_length",
                  defaultOrderBy: "desc",
                },
              ]
                .filter(Boolean)
                .map(({ labelDefault, labelAsc, labelDesc, sortKey, defaultOrderBy }, i) =>
                  match({ sortBy, orderBy })
                    .with({ sortBy: sortKey, orderBy: "asc" }, () => (
                      <Link
                        key={i}
                        href={`${pathname}?${formatQueryParams(
                          mergeRight(searchParams, {
                            sortBy: sortKey,
                            orderBy: "desc",
                            cursor: undefined,
                          })
                        )}`}
                        className={cn(
                          "px-3 py-1 flex items-center gap-2 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-700",
                          "text-indigo-200 bg-indigo-800 hover:bg-indigo-700 opacity-90  border-indigo-800 hover:border-indigo-700"
                        )}
                      >
                        {labelAsc ?? labelDefault}
                      </Link>
                    ))
                    .with({ sortBy: sortKey, orderBy: "desc" }, () => (
                      <Link
                        key={i}
                        href={`${pathname}?${formatQueryParams(
                          mergeRight(searchParams, {
                            sortBy: sortKey,
                            orderBy: "asc",
                            cursor: undefined,
                          })
                        )}`}
                        className={cn(
                          "px-3 py-1 flex items-center gap-2 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-700",
                          "text-indigo-200 bg-indigo-800 hover:bg-indigo-700 opacity-90  border-indigo-800 hover:border-indigo-700"
                        )}
                      >
                        {labelDesc ?? labelDefault}
                      </Link>
                    ))
                    .otherwise(() => (
                      <Link
                        href={`${pathname}?${formatQueryParams(
                          mergeRight(searchParams, {
                            sortBy: sortKey,
                            orderBy: defaultOrderBy,
                            cursor: undefined,
                          })
                        )}`}
                        className={
                          "px-3 py-1 text-center transition border rounded border-slate-700 bg-slate-900 hover:shadow-xl hover:bg-slate-700"
                        }
                      >
                        {labelDefault}
                      </Link>
                    ))
                )}
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
            {hasMore ? (
              <Link
                href={`${pathname}?${formatQueryParams(
                  mergeRight(searchParams, { cursor: nextPageCursor })
                )}`}
              >
                <div className="p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600 w-100">
                  Load more
                </div>
              </Link>
            ) : (
              <div className="text-center text-slate-400">Reached end of results</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
