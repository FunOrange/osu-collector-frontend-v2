import { useMemo } from "react";
import axios from "axios";
import useSWRInfinite from "swr/infinite";
import useSWRImmutable from "swr/immutable";

export const api = axios.create({
  baseURL: process.env.OSU_COLLECTOR_API_BASE_URL,
  withCredentials: true,
});

export function useCancellableSWRImmutable(key, query = undefined) {
  const source = axios.CancelToken.source();
  const { data, error } = useSWRImmutable(key, (url) =>
    api
      .get(url, { params: query, cancelToken: source.token })
      .then((res) => res.data)
  );
  if (error) console.error(error);
  return { data, error, loading: !data, cancelToken: source };
}

function useInfinite(
  url,
  query,
  mappingFunction = (x) => x,
  fetchCondition = true
) {
  const {
    data: pages,
    error,
    isValidating,
    size: currentPage,
    setSize: setCurrentPage,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!fetchCondition) return null;
      let _query = { ...query };
      if (previousPageData?.nextPageCursor) {
        _query.cursor = previousPageData.nextPageCursor;
      }
      return url + "?" + formatQueryParams(_query);
    },
    (url) => api.get(url).then((res) => res.data),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
    }
  );
  if (error) console.error(error);
  // cache object with useMemo
  // otherwise a new object gets created on each render, causing a render loop if used inside a useEffect dependency array
  const entities = useMemo(
    () => pages?.flatMap(mappingFunction) ?? [],
    [JSON.stringify(pages)]
  );
  const hasMore = pages?.length > 0 ? pages[pages.length - 1].hasMore : true;

  return {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}

export function useRecentCollections({ perPage = 9, fetchCondition = true }) {
  const {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  } = useInfinite(
    "/api/collections/recent",
    { perPage },
    (data) => data.collections,
    fetchCondition
  );
  return {
    recentCollections: entities,
    recentCollectionsError: error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}
export function usePopularCollections({ range = "today", perPage = 9 }) {
  const {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  } = useInfinite(
    "/api/collections/popularv2",
    { range, perPage },
    (data) => data.collections
  );
  return {
    popularCollections: entities,
    popularCollectionsError: error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}
export function useCollection(id) {
  const { data, error, mutate } = useSWRImmutable(
    `/api/collections/${id}`,
    (url) => api.get(url).then((res) => res.data)
  );
  if (error) console.error(error);
  return { collection: data, collectionError: error, mutateCollection: mutate };
}
export function useCollectionBeatmaps(
  id,
  { perPage, sortBy, orderBy, filterMin, filterMax }
) {
  const query = {
    perPage,
    sortBy,
    orderBy,
    filterMin:
      filterMin && ["difficulty_rating", "bpm"].includes(sortBy)
        ? filterMin
        : undefined,
    filterMax:
      filterMax && ["difficulty_rating", "bpm"].includes(sortBy)
        ? filterMax
        : undefined,
  };
  const {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  } = useInfinite(
    `/api/collections/${id}/beatmapsv2`,
    query,
    (data) => data.beatmaps
  );
  return {
    collectionBeatmaps: entities,
    collectionBeatmapsError: error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}

export function useUserUploads(userId) {
  const { data, error, mutate } = useSWRImmutable(
    userId ? `/api/users/${userId}/uploads` : null,
    (url) => api.get(url).then((res) => res.data)
  );
  if (error) console.error(error);
  return {
    collections: data?.collections,
    tournaments: data?.tournaments,
    tournamentError: error,
    mutateUploads: mutate,
  };
}

export const useMetadata = () => useCancellableSWRImmutable(`/api/metadata`);
export function useRecentTournaments({ perPage = 10, fetchCondition }) {
  const {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  } = useInfinite(
    "/api/tournaments/recent",
    { perPage },
    (data) => data.tournaments,
    fetchCondition
  );
  return {
    recentTournaments: entities,
    recentTournamentsError: error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}

export function useSearchTournaments({
  search,
  perPage = 10,
  sortBy = undefined,
  orderBy = undefined,
  fetchCondition = true,
}) {
  const {
    entities,
    error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  } = useInfinite(
    "/api/tournaments/search",
    {
      search,
      perPage,
      sortBy,
      orderBy,
    },
    (data) => data.tournaments,
    fetchCondition
  );
  return {
    searchTournaments: entities,
    searchTournamentsError: error,
    isValidating,
    currentPage,
    setCurrentPage,
    hasMore,
  };
}

export function useTournament(id) {
  const { data, error, mutate } = useSWRImmutable(
    `/api/tournaments/${id}`,
    (url) => api.get(url).then((res) => res.data)
  );
  if (error) console.error(error);
  return { tournament: data, tournamentError: error, mutateTournament: mutate };
}
