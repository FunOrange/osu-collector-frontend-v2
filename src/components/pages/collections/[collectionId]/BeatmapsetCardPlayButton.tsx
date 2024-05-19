'use client';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { audioAtom, nowPlayingBeatmapsetIdAtom } from '@/atoms/audio-player';
import { PlayFill, StopFill } from 'react-bootstrap-icons';

export interface BeatmapsetCardPlayButtonProps {
  beatmapsetId: number;
}
export default function BeatmapsetCardPlayButton({ beatmapsetId }: BeatmapsetCardPlayButtonProps) {
  const [audio] = useAtom(audioAtom);
  const [nowPlayingBeatmapsetId, setNowPlayingBeatmapsetId] = useAtom(nowPlayingBeatmapsetIdAtom);
  const [globalPlaying, setGlobalPlaying] = useState(false);
  const playing = globalPlaying && nowPlayingBeatmapsetId === beatmapsetId;

  useEffect(() => {
    const onAudioEnd = () => setGlobalPlaying(false);
    audio.addEventListener('ended', onAudioEnd);
    return () => audio.removeEventListener('ended', onAudioEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPlayClick = () => {
    if (!playing) {
      audio.src = `https://b.ppy.sh/preview/${beatmapsetId}.mp3`;
      audio.volume = 0.2;
      audio.play();
      setGlobalPlaying(true);
      setNowPlayingBeatmapsetId(beatmapsetId);
    } else if (playing) {
      audio.pause();
      setGlobalPlaying(false);
      setNowPlayingBeatmapsetId(undefined);
    }
  };

  const style = {
    filter: 'drop-shadow(0 1px 2px rgb(0 0 0)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))',
  };
  return (
    <button className='p-1 media-play-button' onClick={onPlayClick}>
      {playing ? (
        <StopFill className='text-white' style={style} size={40} />
      ) : (
        <PlayFill className='text-white' style={style} size={40} />
      )}
    </button>
  );
}
