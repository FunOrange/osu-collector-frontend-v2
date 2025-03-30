import { User } from '@/shared/entities/v1/User';
import { StripeSubscription } from '@/entities/stripe/StripeSubscription';
import useSubmit from '@/hooks/useSubmit';
import axios from 'axios';
import useSWRImmutable from 'swr/immutable';
import { match } from 'ts-pattern';
import { Collection } from '@/shared/entities/v1';
import { safe } from '@/utils/string-utils';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export function useUser() {
  type Response = { loggedIn: true; user: User; morphed: boolean } | { loggedIn: false; user: null };
  const { data, mutate, ...rest } = useSWRImmutable<Response>('/users/me', (url) =>
    api.get(url).then((res) => res.data),
  );
  const user = match(data)
    .with({ loggedIn: true }, ({ user }) => user)
    .with({ loggedIn: false }, undefined, () => null)
    .exhaustive();
  const morphed = match(data)
    .with({ loggedIn: true, morphed: true }, () => true)
    .otherwise(() => false);

  const [logout] = useSubmit(async () => {
    await api.post('/logout');
    await mutate();
  });

  const [morph] = useSubmit(async (userId: number) => {
    await api.post('/users/morph', { userId });
    await mutate();
  });

  const [unmorph] = useSubmit(async () => {
    await api.post('/users/unmorph');
    await mutate();
  });

  return { user, morphed, mutate, logout, morph, unmorph, ...rest };
}

export function useCancellableSWRImmutable(key, query = undefined) {
  const source = axios.CancelToken.source();
  const { data, error } = useSWRImmutable(key, (url) =>
    api.get(url, { params: query, cancelToken: source.token }).then((res) => res.data),
  );
  if (error) console.error(error);
  return { data, error, loading: !data, cancelToken: source };
}

export function useCollection(id: string | number) {
  const { data, error, mutate, ...rest } = useSWRImmutable(safe`/collections/${id}`, (url) => api.get(url).then((res) => res.data));
  if (error) console.error(error);
  return { collection: data as Collection, collectionError: error, mutateCollection: mutate, ...rest };
}

export function useUserUploads(userId) {
  const { data, error, mutate } = useSWRImmutable(userId ? `/users/${userId}/uploads` : null, (url) =>
    api.get(url).then((res) => res.data),
  );
  if (error) console.error(error);
  return {
    collections: data?.collections,
    tournaments: data?.tournaments,
    tournamentError: error,
    mutateUploads: mutate,
  };
}

export const useMetadata = () => useCancellableSWRImmutable(`/metadata`);

export function useTournament(id) {
  const { data, error, mutate } = useSWRImmutable(`/tournaments/${id}`, (url) => api.get(url).then((res) => res.data));
  if (error) console.error(error);
  return { tournament: data, tournamentError: error, mutateTournament: mutate };
}

export const useTwitchSubcription = () => {
  const { data: isSubbedToFunOrange, ...rest } = useSWRImmutable('/users/me/twitchSub', (url) =>
    api.get(url).then((res) => res.data.isSubbedToFunOrange),
  );
  return { isSubbedToFunOrange, ...rest };
};

export const usePaypalSubscription = () => {
  const { user } = useUser();
  const { data: paypalSubscription, ...rest } = useSWRImmutable('/payments/paypalSubscription', (url) =>
    api.get(url).then((res) => res.data),
  );
  const isPaypalSubscriptionInEffect =
    new Date(user?.private?.subscriptionExpiryDate?._seconds * 1000) > new Date() ||
    paypalSubscription?.status.toLowerCase() === 'active';
  const canCancelPaypalSubscription = paypalSubscription && paypalSubscription?.status?.toLowerCase() === 'active';
  const paypalEndDate = new Date(
    paypalSubscription?.billing_info.next_billing_time || user?.private?.subscriptionExpiryDate?._seconds * 1000,
  );
  const paypalEndDateVerb =
    new Date() > paypalEndDate ? 'Ended' : paypalSubscription?.status.toLowerCase() === 'active' ? 'Renews' : 'Ends';
  return {
    paypalSubscription,
    isPaypalSubscriptionInEffect,
    canCancelPaypalSubscription,
    paypalEndDate,
    paypalEndDateVerb,
    ...rest,
  };
};

export const useStripeSubscription = () => {
  const { user } = useUser();
  const { data: stripeSubscription, ...rest } = useSWRImmutable<StripeSubscription>(
    '/payments/stripeSubscription',
    (url) => api.get(url).then((res) => res.data),
  );
  const stripeEndDate = ['canceled', 'past_due', 'incomplete', 'incomplete_expired'].includes(
    stripeSubscription?.status,
  )
    ? new Date(user?.private?.subscriptionExpiryDate?._seconds * 1000)
    : new Date(stripeSubscription?.current_period_end * 1000);
  const stripeEndDateVerb =
    new Date() > stripeEndDate
      ? 'Ended'
      : stripeSubscription?.cancel_at_period_end
        ? 'Ends'
        : stripeSubscription?.status.toLowerCase() === 'active'
          ? 'Renews'
          : 'Ends';
  const canCancelStripeSubscription =
    stripeSubscription &&
    stripeSubscription?.status?.toLowerCase() !== 'canceled' &&
    !stripeSubscription?.cancel_at_period_end;
  return {
    stripeSubscription,
    stripeEndDate,
    stripeEndDateVerb,
    canCancelStripeSubscription,
    ...rest,
  };
};
