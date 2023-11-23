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

export function useCollection(id) {
  const { data, error, mutate } = useSWRImmutable(
    `/api/collections/${id}`,
    (url) => api.get(url).then((res) => res.data)
  );
  if (error) console.error(error);
  return { collection: data, collectionError: error, mutateCollection: mutate };
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

export function useTournament(id) {
  const { data, error, mutate } = useSWRImmutable(
    `/api/tournaments/${id}`,
    (url) => api.get(url).then((res) => res.data)
  );
  if (error) console.error(error);
  return { tournament: data, tournamentError: error, mutateTournament: mutate };
}
