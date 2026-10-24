import { Channel } from '@/app/electron/ipc-types';
import useSWR from 'swr';

/**
 * Detected osu! stable / osu!lazer installations. `supported` is false on older versions of the
 * osu!Collector app, which don't detect osu!lazer and only know about the osu! install folder.
 */
export function useOsuClients() {
  const supported = typeof window !== 'undefined' && typeof window.ipc?.getOsuClients === 'function';
  const { data: info, mutate } = useSWR(supported ? Channel.GetOsuClients : null, () => window.ipc.getOsuClients!());
  return { supported, info, mutate };
}
