import MoreResultsButton from "@/components/MoreResultsButton";
import * as api from "@/services/osu-collector-api";
import Link from "next/link";
import { Search, TrophyFill } from "react-bootstrap-icons";
import { formatQueryParams } from "@/utils/string-utils";
import { mergeRight } from "ramda";
import SearchInput from "@/components/pages/all/SearchInput";
import TournamentCard from "@/components/TournamentCard";

interface TournamentsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const { tournaments, hasMore, nextPageCursor } = await (async () => {
    if (searchParams.search) {
      const { tournaments, hasMore, nextPageCursor } = await api.searchCollections({
        search: searchParams.search ?? "",
        cursor: searchParams.cursor,
        sortBy: searchParams.sortBy ?? "_text_match",
        orderBy: searchParams.orderBy ?? "desc",
        perPage: 48,
      });
      return { tournaments, hasMore, nextPageCursor };
    } else {
      const { tournaments, hasMore, nextPageCursor } = await api.getRecentTournaments({
        cursor: searchParams.cursor,
        perPage: 48,
      });
      return { tournaments, hasMore, nextPageCursor };
    }
  })();

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col items-center w-full gap-6 px-2 py-5 md:px-10">
        <div className="flex flex-col items-center gap-3">
          <SearchInput searchParams={searchParams} withIcon />
        </div>
        <div className="w-full p-4 mb-4 rounded max-w-screen-2xl bg-slate-800 md:p-7">
          <h1 className="mb-6 text-3xl">
            <TrophyFill className="inline mb-1 mr-3 text-yellow-400" size={24} />
            Tournaments
          </h1>
          <div className="grid grid-cols-1 gap-4 mb-5 md:gap-8 lg:grid-cols-2">
            {!tournaments ? (
              <div className="text-red-500">There was an error retrieving tournaments.</div>
            ) : (
              tournaments.map((tournament, i) => <TournamentCard key={i} tournament={tournament} />)
            )}
          </div>
          {hasMore ? (
            <Link
              href={`/all?${formatQueryParams(
                mergeRight(searchParams, { cursor: nextPageCursor })
              )}`}
            >
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