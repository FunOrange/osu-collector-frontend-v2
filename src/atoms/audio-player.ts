import { atom } from 'jotai';

export const audioAtom = atom<HTMLAudioElement>(typeof window !== 'undefined' ? new Audio() : undefined);
export const nowPlayingBeatmapsetIdAtom = atom<number>(undefined as number);
