import SearchInput from "@/components/pages/all/SearchInput";
import * as api from "@/services/osu-collector-api";
import { TrophyFill } from "react-bootstrap-icons";

interface TournamentsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const { tournaments, hasMore, nextPageCursor } = await (async () => {
    if (searchParams.search) {
      const { tournaments, hasMore, nextPageCursor } = await api.searchTournaments({
        search: (searchParams.search as string) ?? "",
        cursor: searchParams.cursor as string,
        sortBy: (searchParams.sortBy as string) ?? "_text_match",
        orderBy: (searchParams.orderBy as string) ?? "desc",
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
        <div className="w-full p-4 mb-4 rounded max-w-screen-2xl bg-slate-700 md:p-7">
          <h1 className="mb-6 text-3xl">
            <TrophyFill className="inline mb-1 mr-3 text-yellow-400" size={24} />
            Tournaments
          </h1>
        </div>
      </div>
    </div>
  );
}
