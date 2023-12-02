import { atom } from "jotai";

export const audioAtom = atom<HTMLAudioElement>(new Audio());
export const nowPlayingBeatmapsetIdAtom = atom<number>(undefined as number);
