import { Beatmap } from '@/shared/entities/v1/Beatmap';
import { Collection } from '@/shared/entities/v1/Collection';
import { formatQueryParams } from '@/utils/string-utils';
import axios from 'axios';

const get = async <T>(url: string) => {
  const startMs = Date.now();
  const res = await fetch(baseURL + url, {
    next: { revalidate: 1 },
  });
  const data = (await res.json()) as T;
  const duration = Date.now() - startMs;
  const environment = typeof window !== 'undefined' ? 'browser' : 'server';
  console.log(`[${environment}] GET ${url} (${duration} ms)`);
  return data;
};

const baseURL = typeof window !== 'undefined' ? '/api' : process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST + '/api';
export const api = axios.create({
  baseURL,
  withCredentials: true,
});
api.interceptors.request.use(function (config) {
  // @ts-ignore:next-line
  config.metadata = { startMs: Date.now() };
  return config;
});
api.interceptors.response.use(function (response) {
  const method = response.config.method.toUpperCase();
  const queryParams = formatQueryParams(response.config.params) ? '?' + formatQueryParams(response.config.params) : '';
  const duration = Date.now() - (response.config as any).metadata.startMs;
  const environment = typeof window !== 'undefined' ? 'browser' : 'server';
  console.log(`[${environment}] ${method} ${response.config.url}${queryParams} (${duration} ms)`);
  return response;
});

export async function getRecentCollections({ cursor = undefined, perPage = undefined }) {
  const params = {
    cursor,
    perPage,
  };
  return api
    .get('/collections/recent', {
      params,
    })
    .then((res) => res.data);
}

// range: 'today' or 'week' or 'month' or 'year' or 'alltime'
// Returns PaginatedCollectionData object: https://osucollector.com/docs.html#responses-getCollections-200-schema
export async function getPopularCollections({ range = 'today', cursor = undefined, perPage = undefined }) {
  const params = {
    range,
    cursor,
    perPage,
  };
  return api
    .get<{
      nextPageCursor: number | null;
      hasMore: boolean;
      collections: Collection[];
    }>('/collections/popularv2', {
      params,
    })
    .then((res) => res.data);
}

// Returns PaginatedCollectionData object: https://osucollector.com/docs.html#responses-getCollections-200-schema
export async function searchCollections({
  search,
  cursor,
  perPage = undefined,
  sortBy = undefined,
  orderBy = undefined,
}) {
  const params = { search, cursor, perPage, sortBy, orderBy };
  return api
    .get('/collections/search', {
      params,
    })
    .then((res) => res.data);
}

// Returns CollectionData object: https://osucollector.com/docs.html#responses-getCollectionById-200-schema
export async function getCollection(id) {
  return await get<Collection>(`/collections/${id}?withBeatmapsets=false`);
}

// Returns PaginatedCollectionData object: https://osucollector.com/docs.html#responses-getCollectionBeatmaps-200-schema
export async function getCollectionBeatmaps({
  collectionId,
  cursor = undefined,
  perPage = undefined,
  sortBy = undefined,
  orderBy = undefined,
  filterMin = undefined,
  filterMax = undefined,
}) {
  const params = {
    cursor,
    perPage,
    sortBy,
    orderBy,
    filterMin: filterMin && ['difficulty_rating', 'bpm'].includes(sortBy) ? filterMin : undefined,
    filterMax: filterMax && ['difficulty_rating', 'bpm'].includes(sortBy) ? filterMax : undefined,
  };
  return api
    .get<{
      nextPageCursor: number | null;
      hasMore: boolean;
      beatmaps: Beatmap[];
    }>(`/collections/${collectionId}/beatmapsv2`, {
      params,
    })
    .then((res) => res.data);
}
// throws error on upload failure
export async function uploadCollections(collections) {
  return await api.post(`/collections/upload`, collections).then((res) => res.data);
}

// Returns true on success
export async function favouriteCollection(collectionId) {
  return await api.post(`/collections/${collectionId}/favourite`);
}

// Returns true on success
export async function unfavouriteCollection(collectionId) {
  return await api.delete(`/collections/${collectionId}/favourite`);
}

export async function editCollectionDescription(collectionId, description) {
  return await api.put(`/collections/${collectionId}/description`, {
    description: description,
  });
}

export async function renameCollection(collectionId, name) {
  return await api.put(`/collections/${collectionId}/rename`, { name });
}

export async function deleteCollection(collectionId) {
  return await api.delete(`/collections/${collectionId}`);
}

export async function downloadCollectionDb(collectionId) {
  return await api
    .get(`/collections/${collectionId}/collectionDb/export`, {
      responseType: 'arraybuffer',
    })
    .then((res) => res.data);
}

// Returns PaginatedUserData object
export async function getUsers({ page, perPage }) {
  return await api
    .get('/users', {
      params: { page, perPage },
    })
    .then((res) => res.data);
}

export async function getUser(userId) {
  return await api.get(`/users/${userId}`).then((res) => res.data);
}

export async function getOwnUser() {
  const response = await api.get(`/users/me`);
  const { loggedIn, user } = response.data;
  return loggedIn ? user : null;
}
export async function getUserFavouriteCollections(userId) {
  return api.get(`/users/${userId}/favourites/collections`, {}).then((res) => res.data);
}

export async function getUserFavouriteTournaments(userId) {
  return api.get(`/users/${userId}/favourites/tournaments`, {}).then((res) => res.data);
}

export async function getUserUploads(userId) {
  return api.get(`/users/${userId}/uploads`, {}).then((res) => res.data);
}
export async function getMetadata() {
  return api.get(`/metadata`, {}).then((res) => res.data);
}

export async function submitOtp(otp, y) {
  return await api.post(`/authentication/otp?otp=${otp}&y=${y}`);
}

export async function getTwitchSubStatus() {
  return await api.get('/users/me/twitchSub').then((res) => res.data.isSubbedToFunOrange);
}

export async function linkPaypalSubscription(subscriptionId) {
  if (!subscriptionId) {
    throw new Error('subscriptionId is required');
  }
  return await api
    .post('/payments/paypalSubscription/link', { subscriptionId: subscriptionId })
    .then((res) => res.data);
}

export async function getPaypalSubscription() {
  return await api.get('/payments/paypalSubscription', {}).then((res) => res.data);
}

export async function cancelPaypalSubscription() {
  await api.post('/payments/paypalSubscription/cancel');
}

export async function createCustomer(email) {
  return await api.post(`/payments/createCustomer`, { email }).then((res) => res.data);
}

export async function createSubscription() {
  return await api.post(`/payments/createSubscription`).then((res) => res.data);
}

export async function getSubscription() {
  return await api.get(`/payments/stripeSubscription`).then((res) => res.data);
}

export async function cancelStripeSubscription() {
  return await api.post('/payments/cancelSubscription').then((res) => res.data);
}

export async function unlinkTwitchAccount() {
  return await api.post(`/users/me/unlinkTwitch`).then((res) => res.data);
}

export async function getInstallerURL(platform = undefined) {
  return await api.get('/installerURL', { params: { platform } }).then((res) => res.data);
}

export async function postComment(collectionId, message) {
  return await api
    .post(`/collections/${collectionId}/comments`, {
      message,
    })
    .then((res) => res.data);
}

export async function likeComment(collectionId, commentId, remove = false) {
  return await api
    .post(`/collections/${collectionId}/comments/${commentId}/like`, {
      remove,
    })
    .then((res) => res.data);
}

export async function deleteComment(collectionId, commentId) {
  return await api.delete(`/collections/${collectionId}/comments/${commentId}`).then((res) => res.data);
}

export async function createTournament(createTournamentDto) {
  const route = '/tournaments';
  const res = await api.post(route, createTournamentDto);
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}

export interface UpdateTournamentDto {
  name?: string;
  description?: string;
  link?: string;
  banner?: string;
  downloadUrl?: string;
  organizers?: any[];
  rounds?: any[];
}
export async function editTournament(id, dto: UpdateTournamentDto) {
  const route = `/tournaments/${id}`;
  const res = await api.patch(route, dto);
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}

export async function getRecentTournaments({ cursor = undefined, perPage = undefined }) {
  const params = { cursor, perPage };
  return api
    .get('/tournaments/recent', {
      params,
    })
    .then((res) => res.data);
}
export async function searchTournaments(params: {
  search: string;
  cursor: string | number;
  perPage: string | number;
  sortBy: string;
  orderBy: string;
}) {
  return api
    .get('/tournaments/search', {
      params,
    })
    .then((res) => res.data);
}
export async function getTournament(id) {
  return await api.get(`/tournaments/${id}`).then((res) => res.data);
}
export async function deleteTournament(id) {
  return await api.delete(`/tournaments/${id}`);
}

export async function favouriteTournament(tournamentId, favourited) {
  return await api
    .patch('/users/me/favouriteTournament', {
      tournamentId: Number(tournamentId),
      favourited,
    })
    .then((res) => res.data);
}

export async function changeUser({ username, userId }) {
  const route = '/users/changeUser';
  const res = await api.post(route, { username, userId });
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}
