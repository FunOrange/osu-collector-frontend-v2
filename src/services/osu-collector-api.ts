import { formatQueryParams } from "@/utils/string-utils";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_BASE_URL,
  withCredentials: true,
});
api.interceptors.request.use(function (config) {
  // @ts-ignore:next-line
  config.metadata = { startMs: Date.now() };
  return config;
});
api.interceptors.response.use(function (response) {
  console.log(
    `${response.config.method.toUpperCase()} ${response.config.url}${
      formatQueryParams(response.config.params)
        ? "?" + formatQueryParams(response.config.params)
        : ""
    } (${Date.now() - (response.config as any).metadata.startMs} ms)`
  );
  return response;
});

export async function getRecentCollections({
  cursor = undefined,
  perPage = undefined,
  cancelCallback = undefined,
}) {
  const params = {
    cursor,
    perPage,
  };
  return api
    .get("/collections/recent", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}

// range: 'today' or 'week' or 'month' or 'year' or 'alltime'
// Returns PaginatedCollectionData object: https://osucollector.com/docs.html#responses-getCollections-200-schema
export async function getPopularCollections({
  range = "today",
  cursor = undefined,
  perPage = undefined,
  cancelCallback = undefined,
}) {
  const params = {
    range,
    cursor,
    perPage,
  };
  return api
    .get("/collections/popularv2", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
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
  cancelCallback = undefined,
}) {
  const params = { search, cursor, perPage, sortBy, orderBy };
  return api
    .get("/collections/search", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}

// Returns CollectionData object: https://osucollector.com/docs.html#responses-getCollectionById-200-schema
export async function getCollection(id, cancelCallback = undefined) {
  return api
    .get(`/collections/${id}`, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
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
  cancelCallback = undefined,
}) {
  const params = {
    cursor,
    perPage,
    sortBy,
    orderBy,
    filterMin: filterMin && ["difficulty_rating", "bpm"].includes(sortBy) ? filterMin : undefined,
    filterMax: filterMax && ["difficulty_rating", "bpm"].includes(sortBy) ? filterMax : undefined,
  };
  return api
    .get(`/collections/${collectionId}/beatmapsv2`, {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}
// throws error on upload failure
export async function uploadCollections(collections) {
  try {
    const response = await api.post(`/collections/upload`, collections);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `/collections/upload responded with ${error.response.status}: ${error.response.data}`
    );
  }
}

// Returns true on success
export async function favouriteCollection(collectionId) {
  try {
    await api.post(`/collections/${collectionId}/favourite`);
    console.log(`collection ${collectionId} added to favourites`);
    return true;
  } catch (error) {
    console.error(error);
    console.error(error.response.data);
    return false;
  }
}

// Returns true on success
export async function unfavouriteCollection(collectionId) {
  try {
    await api.delete(`/collections/${collectionId}/favourite`);
    console.log(`collection ${collectionId} removed from favourites`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function editCollectionDescription(collectionId, description) {
  try {
    await api.put(`/collections/${collectionId}/description`, {
      description: description,
    });
    console.log("description successfully edited");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function renameCollection(collectionId, name) {
  try {
    await api.put(`/collections/${collectionId}/rename`, { name });
    console.log("collection successfully renamed");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteCollection(collectionId) {
  try {
    await api.delete(`/collections/${collectionId}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function downloadCollectionDb(collectionId) {
  const route = `/collections/${collectionId}/collectionDb/export`;
  try {
    const res = await api.get(route, {
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    throw new Error(`${route} responded with ${err.response.status}: ${err.response.statusText}`);
  }
}

// Returns PaginatedUserData object
export async function getUsers(page, perPage = undefined, cancelCallback = undefined) {
  const params = {
    page,
    perPage,
  };
  return api
    .get("/users", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}

// Returns User object or null if 404
export async function getUser(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// https://osucollector.com/docs.html#responses-getOwnUser-200-schema
// (schema might not show in above link, if that's the case open openapi.yaml in swagger editor)
// https://osucollector.com/openapi.yaml
// https://editor.swagger.io/
export async function getOwnUser() {
  const response = await api.get(`/users/me`);
  const { loggedIn, user } = response.data;
  return loggedIn ? user : null;
}
export async function getUserFavourites(userId, cancelCallback = undefined) {
  return api
    .get(`/users/${userId}/favourites`, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}

export async function getUserUploads(userId, cancelCallback = undefined) {
  return api
    .get(`/users/${userId}/uploads`, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}
export async function getMetadata(cancelCallback = undefined) {
  return api
    .get(`/metadata`, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}

export async function submitOtp(otp, y) {
  return await api.post(`/authentication/otp?otp=${otp}&y=${y}`);
}

export async function getTwitchSubStatus(cancelCallback = undefined) {
  const endpoint = "/users/me/twitchSub";
  try {
    const response = await api.get(endpoint, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    });
    return response.data.isSubbedToFunOrange;
  } catch (err) {
    if (err.toString() === "Cancel") {
      return;
    }
    if (err.response.status === 404) {
      return null;
    } else {
      console.log(`${endpoint} responded with ${err.response.status}: ${err.response.data}`);
      return null;
    }
  }
}

export async function linkPaypalSubscription(subscriptionId) {
  const endpoint = "/payments/paypalSubscription/link";
  if (!subscriptionId) {
    throw new Error("subscriptionId is required");
  }
  try {
    const response = await api.post(endpoint, {
      subscriptionId: subscriptionId,
    });
    return response.data;
  } catch (err) {
    throw new Error(`${endpoint} responded with ${err.response.status}: ${err.response.data}`);
  }
}

export async function getPaypalSubscription(cancelCallback = undefined) {
  const endpoint = "/payments/paypalSubscription";
  try {
    const response = await api.get(endpoint, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    });
    return response.data;
  } catch (err) {
    if (err.toString() === "Cancel") {
      return;
    }
    if (err.response.status === 404) {
      return null;
    } else {
      console.log(`${endpoint} responded with ${err.response.status}: ${err.response.data}`);
      return null;
    }
  }
}

export async function cancelPaypalSubscription() {
  const endpoint = "/payments/paypalSubscription/cancel";
  try {
    await api.post(endpoint);
  } catch (err) {
    if (err.response.status !== 404) {
      throw new Error(
        `${endpoint} responded with ${err.response.status}: ${JSON.stringify(err.response.data)}`
      );
    } else {
      console.error(err);
    }
  }
}

export async function createCustomer(email) {
  try {
    const response = await api.post(`/payments/createCustomer`, { email });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `/payments/createCustomer responded with ${
        error.response.status
      }: ${await error.response.text()}`
    );
  }
}

export async function createSubscription() {
  try {
    const response = await api.post(`/payments/createSubscription`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `/payments/createSubscription responded with ${
        error.response.status
      }: ${await error.response.text()}`
    );
  }
}

export async function getSubscription(cancelCallback = undefined) {
  try {
    const response = await api.get(`/payments/stripeSubscription`, {
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    });
    return response.data;
  } catch (err) {
    if (err.toString() === "Cancel") {
      return;
    }
    if (err.response?.status === 404) {
      return null;
    } else {
      console.error(
        `/payments/createSubscription responded with ${err.response?.status}: ${err.response?.data}`
      );
      return null;
    }
  }
}

export async function cancelStripeSubscription() {
  const endpoint = "/payments/cancelSubscription";
  try {
    const response = await api.post(endpoint);
    return response.data;
  } catch (err) {
    throw new Error(`${endpoint} responded with ${err.response.status}: ${err.response.data}`);
  }
}

export async function unlinkTwitchAccount() {
  try {
    const response = await api.post(`/users/me/unlinkTwitch`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `/users/me/unlinkTwitch responded with ${
        error.response.status
      }: ${await error.response.text()}`
    );
  }
}

export async function getInstallerURL(platform = undefined) {
  const response = await api.get("/installerURL", {
    params: { platform },
  });
  return response.data;
}

export async function postComment(collectionId, message) {
  try {
    const response = await api.post(`/collections/${collectionId}/comments`, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const response = error.response;
    throw new Error(
      `POST /collections/${collectionId}/comments responded with ${
        response.status
      }: ${await response.text()}`
    );
  }
}

export async function likeComment(collectionId, commentId, remove = false) {
  try {
    const response = await api.post(`/collections/${collectionId}/comments/${commentId}/like`, {
      remove,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const response = error.response;
    throw new Error(
      `POST /collections/${collectionId}/comments/${commentId}/like responded with ${response.status}: ${response.data}`
    );
  }
}

export async function deleteComment(collectionId, commentId) {
  try {
    const response = await api.delete(`/collections/${collectionId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    const response = error.response;
    throw new Error(
      `DELETE /collections/${collectionId}/comments/${commentId} responded with ${response.status}: ${response.data}`
    );
  }
}

export async function reportComment(collectionId, commentId) {
  try {
    const response = await api.post(`/collections/${collectionId}/comments/${commentId}/report`);
    return response.data;
  } catch (error) {
    console.error(error);
    const response = error.response;
    throw new Error(
      `POST /collections/${collectionId}/comments/${commentId}/report responded with ${
        response.status
      }: ${await response.text()}`
    );
  }
}

export async function logout() {
  const route = "/logout";
  try {
    await api.post(route);
  } catch (error) {
    console.error(`${route} responded with ${error.response.status}: ${error.response.data}`);
  }
}

export async function createTournament(createTournamentDto) {
  const route = "/tournaments";
  const res = await api.post(route, createTournamentDto);
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}

export async function editTournament(id, createTournamentDto) {
  const route = `/tournaments/${id}`;
  const res = await api.patch(route, createTournamentDto);
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}

export async function getRecentTournaments(
  cursor = undefined,
  perPage = undefined,
  cancelCallback = undefined
) {
  const params = {
    cursor,
    perPage,
  };
  return api
    .get("/tournaments/recent", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}
export async function searchTournaments(
  queryString,
  cursor,
  perPage = undefined,
  sortBy = undefined,
  orderBy = undefined,
  cancelCallback = undefined
) {
  const params = {
    search: queryString,
    cursor,
    perPage,
    sortBy,
    orderBy,
  };
  return api
    .get("/tournaments/search", {
      params,
      cancelToken: cancelCallback ? new axios.CancelToken(cancelCallback) : undefined,
    })
    .then((res) => res.data);
}
export async function getTournament(id, cancelCallback = undefined) {
  return api.get(`/tournaments/${id}`, cancelCallback).then((res) => res.data);
}
export async function deleteTournament(id) {
  try {
    const response = await api.delete(`/tournaments/${id}`);
    console.log("tournament successfully deleted");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function linkIrc(ircName) {
  const route = "/users/me/linkIrc";
  try {
    const res = await api.patch(route, { ircName });
    return res.data;
  } catch (error) {
    throw new Error(`${route} responded with ${error.response.status}: ${error.response.data}`);
  }
}

export async function updateNpCollectionId(collectionId) {
  const route = "/users/me/npCollectionId";
  try {
    const res = await api.patch(route, { collectionId });
    return res.data;
  } catch (error) {
    console.error(`${route} responded with ${error.response.status}: ${error.response.data}`);
  }
}

export async function favouriteTournament(tournamentId, favourited) {
  const route = "/users/me/favouriteTournament";
  try {
    const res = await api.patch(route, {
      tournamentId: Number(tournamentId),
      favourited,
    });
    return res.data;
  } catch (error) {
    console.error(`${route} responded with ${error.response.status}: ${error.response.data}`);
  }
}

export async function changeUser({ username, userId }) {
  const route = "/users/changeUser";
  const res = await api.post(route, { username, userId });
  if (res.status !== 200) {
    throw new Error(`${route} responded with ${res.status}: ${res.data}`);
  }
  return res.data;
}
