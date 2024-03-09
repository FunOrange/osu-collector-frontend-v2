import moment from "moment";
import ModeCounters from "@/components/ModeCounters";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import Image from "next/image";
import { formatQueryParams, getUrlSlug } from "@/utils/string-utils";
import { identity, mergeRight } from "ramda";
import { Pattern, match } from "ts-pattern";
import { groupBeatmapsets } from "@/entities/Beatmap";
import { cn } from "@/utils/shadcn-utils";
import FavouriteButton from "@/components/FavouriteButton";
import ImageWithFallback from "@/components/universal/ImageWithFallback";
import TournamentMappool from "@/components/pages/tournaments/[tournamentId]/TournamentMappool";
// import BarGraphStars from "@/components/pages/collections/[collectionId]/BarGraphStars";
// import BarGraphBpm from "@/components/pages/collections/[collectionId]/BarGraphBpm";
// import DownloadMapsButton from "@/components/pages/collections/[collectionId]/DownloadMapsButton";
// import AddToOsuButton from "@/components/pages/collections/[collectionId]/AddToOsuButton";
// import BeatmapsetListing from "@/components/pages/collections/[collectionId]/BeatmapsetListing";
// import TournamentCommentsSection from "@/components/pages/collections/[collectionId]/TournamentCommentsSection";
// import EditableTournamentName from "@/components/pages/collections/[collectionId]/EditableTournamentName";
// import TournamentDeleteButton from "@/components/pages/collections/[collectionId]/TournamentDeleteButton";
// import EditableTournamentDescription from "@/components/pages/collections/[collectionId]/EditableTournamentDescription";
// import TournamentUpdateButton from "@/components/pages/collections/[collectionId]/TournamentUpdateButton";

interface TournamentPageProps {
  params: { tournamentId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function TournamentPage({ params, searchParams }: TournamentPageProps) {
  const tournament = await api.getTournament(params.tournamentId);

  const searchParamsSortBy = match(searchParams.sortBy)
    .with("beatmapset.artist", identity)
    .with("beatmapset.title", identity)
    .with("beatmapset.creator", identity)
    .with("difficulty_rating", identity)
    .with("bpm", identity)
    .with("hit_length", identity)
    .otherwise(() => undefined);
  const searchParamsOrderBy = match(searchParams.orderBy)
    .with("asc", identity)
    .with("desc", identity)
    .otherwise(() => undefined);
  const { orderBy, sortBy } = match({ searchParamsSortBy, searchParamsOrderBy })
    .with({ searchParamsSortBy: Pattern.string, searchParamsOrderBy: Pattern.string }, () => ({
      sortBy: searchParamsSortBy,
      orderBy: searchParamsOrderBy,
    }))
    .otherwise(() => ({
      sortBy: "beatmapset.artist",
      orderBy: "asc",
    }));

  const pathname = `/tournaments/${tournament.id}/${getUrlSlug(tournament.name)}`;

  const replaceQueryParams = (newParams: any) =>
    `${pathname}?${formatQueryParams(mergeRight(searchParams, newParams))}`;

  const bannerHeight = 330;
  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col w-full max-w-screen-xl px-2 py-5 md:px-10 gap-7">
        <div className="rounded bg-slate-800">
          <div className="relative" style={{ height: `${bannerHeight}px` }}>
            <div
              className="absolute w-full overflow-hidden rounded-t-lg"
              style={{ height: `${bannerHeight}px` }}
            >
              <ImageWithFallback
                src={tournament.banner}
                fallbackSrc={"/images/slimcoverfallback.jpg"}
                alt={tournament.name}
                className="rounded-t-lg"
                style={{ transition: "filter 0.1s", objectFit: "cover" }}
                fill
                sizes="100vw"
              />
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-4xl rounded">{tournament.name}</h1>
            <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <div className="pr-4">
                <small className="text-slate-400">
                  Uploaded {moment.unix(tournament.dateUploaded._seconds).fromNow()}
                </small>
                <div
                  className="grid items-center w-full gap-4 pt-2"
                  style={{ gridTemplateColumns: "auto 1fr" }}
                >
                  <div className="py-2 pr-6 border-r border-slate-700 text-slate-400">Uploader</div>
                  <div className="flex items-center gap-1">
                    <UserChip
                      userId={tournament.uploader.id}
                      username={tournament.uploader.username}
                      rank={tournament.uploader.rank}
                    />
                  </div>
                  <div className="py-2 pr-6 border-r border-slate-700 text-slate-400">
                    Organizers
                  </div>
                  <div className="flex items-center gap-1">
                    {tournament.organizers.map((organizer, i) => (
                      <UserChip
                        key={i}
                        userId={organizer.id}
                        username={organizer.username}
                        rank={undefined}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className="grid mt-2 gap-x-3 gap-y-1"
                  style={{ gridTemplateColumns: "auto 1fr" }}
                >
                  <div>Forum post:</div>
                  <a target="_blank" href={tournament.link} className="underline truncate">
                    {tournament.link}
                  </a>
                  <div>Spreadsheet:</div>
                  {false ? (
                    <a target="_blank" href={tournament.downloadUrl} className="underline truncate">
                      {tournament.downloadUrl}
                    </a>
                  ) : (
                    <div className="text-slate-500">No spreadsheet link provided.</div>
                  )}
                  <div>Mappool download:</div>
                  {tournament?.downloadUrl ? (
                    <a target="_blank" href={tournament.downloadUrl} className="underline truncate">
                      {tournament.downloadUrl}
                    </a>
                  ) : (
                    <div className="text-slate-500">No download link provided.</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-end gap-2 pl-4 border-l border-slate-700">
                {/* <TournamentDeleteButton collection={collection} />
                <DownloadMapsButton collection={collection} />
                <AddToOsuButton collection={collection} />
                <FavouriteButton collection={collection} variant="fullWidth" />
                <TournamentUpdateButton collection={collection} /> */}
              </div>
            </div>
          </div>
        </div>

        {/* <TournamentCommentsSection collection={collection} /> */}
        <div className="rounded bg-slate-800" style={{ minHeight: "calc(100vh - 56px)" }}>
          <TournamentMappool tournament={tournament} />
        </div>
      </div>
    </div>
  );
}

const UserChip = ({ userId, username, rank }) => (
  <div className="flex items-center justify-start px-2 py-1 mt-1 transition rounded-lg cursor-pointer first-letter:items-center hover:bg-slate-900">
    <Image
      className="mr-2 rounded-full"
      src={`https://a.ppy.sh/${userId}`}
      width={32}
      height={32}
      alt={"Tournament uploader avatar"}
    />
    <div className="flex flex-col">
      <div className="text-sm font-semibold whitespace-nowrap">{username}</div>
      {rank > 0 && <small className="text-xs text-slate-500">#{rank}</small>}
    </div>
  </div>
);
