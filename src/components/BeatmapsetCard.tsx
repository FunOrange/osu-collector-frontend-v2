"use client";
import { useEffect, useRef, useState } from "react";
import { Clipboard, PlayFill, StopFill } from "react-bootstrap-icons";
import Image from "next/image";
import { match } from "ts-pattern";
import { secondsToHHMMSS } from "@/utils/date-time-utils";
import { bpmToColor, starToColor } from "@/utils/theme-utils";
import { Beatmap } from "@/entities/Beatmap";
import { Beatmapset } from "@/entities/Beatmapset";
import fallbackOnError from "@/utils/misc-utils";

export interface BeatmapsetCardCardProps {
  beatmapset: Beatmapset;
  beatmaps: Beatmap[];
  playing?: boolean;
  onPlayClick?: () => void;
  onAudioEnd?: (this: HTMLAudioElement, ev: Event) => any;
}
export default function BeatmapsetCard({
  beatmapset,
  beatmaps,
  playing,
  onPlayClick,
  onAudioEnd,
}: BeatmapsetCardCardProps) {
  const audioRef = useRef(null);

  // useEffect(() => {
  //   const audio = new Audio(`https://b.ppy.sh/preview/${beatmapset.id}.mp3`);
  //   audio.volume = 0.2;
  //   audio.addEventListener("ended", onAudioEnd);
  //   audioRef.current = audio;

  //   return () => {
  //     if (audioRef.current && !audioRef.current.paused) {
  //       audioRef.current.pause();
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!audioRef.current) return;
  //   if (playing) {
  //     audioRef.current.play();
  //   } else {
  //     audioRef.current.pause();
  //     audioRef.current.currentTime = 0;
  //   }
  // }, [playing]);

  const clipboardRef = useRef(null);
  const [showCopiedToClipboard, setShowCopiedToClipboard] = useState(false);

  const slimcoverfallback = "/public/images/slimcoverfallback.jpg";

  return (
    <>
      {/* <div className="block md:hidden">
        <div className="mb-5 mr-2" style={{}}>
          <Image
            className="card-img-top"
            src={beatmapset.covers.card}
            alt={beatmapset.title}
            width={128}
            height={64}
            onError={(ev) => fallbackOnError(ev, slimcoverfallback)}
          />
          <div className="py-2 pl-3 pr-1">
            <div className="flex justify-between">
              <div style={{ width: "100%" }}>
                <div className="my-0 img-overlay-text">
                  <div className="truncate">{beatmapset.title}</div>
                </div>
                <div className="img-overlay-text">
                  <div className="truncate">{beatmapset.artist}</div>
                </div>
              </div>
              <div className="align-self-center">
                <button className="p-0 media-play-button" onClick={onPlayClick}>
                  {playing ? (
                    <StopFill className="svg-shadow" size={40} />
                  ) : (
                    <PlayFill className="svg-shadow" size={40} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="p-1 text-center">
            <small>Mapped by {beatmapset.creator}</small>
          </div>
          <div>
            {beatmaps.map((beatmap) => (
              <div key={beatmap.id} className="px-2">
                <div className="flex items-center p-0">
                  <div
                    className="mr-1"
                    style={{
                      minWidth: "50px",
                      height: "24px",
                      paddingTop: "6px",
                    }}
                  >
                    {secondsToHHMMSS(beatmap.hit_length)}
                  </div>
                  <div
                    className="mr-1"
                    style={{
                      backgroundColor: bpmToColor(beatmap.bpm),
                      minWidth: "70px",
                      height: "24px",
                      paddingTop: "6px",
                    }}
                  >
                    {Math.floor(beatmap.bpm)} bpm
                  </div>
                  <DifficultyBadge
                    className="mr-3"
                    stars={beatmap.difficulty_rating}
                  />
                  {beatmap.mode !== "osu" && (
                    <Image
                      src={match(beatmap.mode)
                        .with("taiko", () => "/icons/mode-taiko.png")
                        .with("mania", () => "/icons/mode-mania.png")
                        .with("fruits", () => "/icons/mode-catch.png")
                        .exhaustive()}
                      width={20}
                      height={20}
                      alt={beatmap.mode}
                      className="mr-2"
                    />
                  )}
                  <div className="mr-2 w-100">
                    <div className="truncate font-weight-bold">
                      {beatmap.version}
                    </div>
                  </div>
                  <a
                    href={beatmap.url}
                    target="blank"
                    className="px-2 py-0 mr-1 ms-auto"
                  >
                    Website
                  </a>
                  <a className="px-2 py-0 mx-1" href={`osu://b/${beatmap.id}`}>
                    Direct
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "340px 1fr" }}
        >
          {/* beatmapset */}
          <div className="relative rounded bg-slate-700">
            <div className="absolute">
              <Image
                src={beatmapset.covers.card}
                alt={beatmapset.title}
                width={340}
                height={64}
                style={{
                  height: "64px",
                  objectFit: "cover",
                  filter: "brightness(0.5)",
                }}
                onError={(ev) => fallbackOnError(ev, slimcoverfallback)}
              />
            </div>
            <div className="relative z-10 py-2 pl-3 pr-1">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "1fr 50px" }}
              >
                <div style={{ maxWidth: "264px" }}>
                  <div
                    className="text-lg font-medium text-gray-100 truncate"
                    style={{
                      textShadow:
                        "2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000",
                    }}
                  >
                    {beatmapset.title}
                  </div>
                  <div
                    className="text-sm font-medium text-gray-100 truncate"
                    style={{
                      textShadow:
                        "2px 2px 4px #000, 2px 2px 4px #000, 2px 2px 4px #000",
                    }}
                  >
                    {beatmapset.artist}
                  </div>
                </div>
                <button className="p-1 media-play-button" onClick={onPlayClick}>
                  {playing ? (
                    <StopFill className="svg-shadow" size={40} />
                  ) : (
                    <PlayFill className="svg-shadow" size={40} />
                  )}
                </button>
              </div>
            </div>
            <div className="p-1 text-center bg-slate-700">
              <small>Mapped by {beatmapset.creator}</small>
            </div>
          </div>
          {/* diffs */}
          <div>
            <div className="rounded bg-slate-700">
              {beatmaps.map((beatmap) => (
                <div
                  key={beatmap.id}
                  className="grid items-center gap-2 p-2"
                  style={{ gridTemplateColumns: "auto 1fr auto" }}
                >
                  <div className="flex gap-1">
                    <div
                      className="py-1 text-xs text-center bg-gray-600 rounded"
                      style={{ minWidth: "50px" }}
                    >
                      {secondsToHHMMSS(beatmap.hit_length)}
                    </div>
                    <div
                      className="py-1 text-xs text-center rounded text-sky-900"
                      style={{
                        backgroundColor: bpmToColor(beatmap.bpm),
                        minWidth: "70px",
                      }}
                    >
                      {Math.floor(beatmap.bpm)} bpm
                    </div>
                    <div
                      className="py-1 text-xs text-center rounded"
                      style={{
                        minWidth: "64px",
                        backgroundColor: starToColor(beatmap.difficulty_rating),
                      }}
                    >
                      {beatmap.difficulty_rating.toFixed(2)} ★
                    </div>
                    {beatmap.mode !== "osu" && (
                      <Image
                        src={match(beatmap.mode)
                          .with("taiko", () => "/icons/mode-taiko.png")
                          .with("mania", () => "/icons/mode-mania.png")
                          .with("fruits", () => "/icons/mode-catch.png")
                          .exhaustive()}
                        alt={beatmap.mode}
                        width={20}
                        height={20}
                        style={{
                          imageRendering: "auto",
                          width: "18px",
                          height: "auto",
                        }}
                        className="mr-2"
                      />
                    )}
                  </div>

                  <b className="mr-2 truncate">{beatmap.version}</b>

                  <div className="flex items-center gap-1 ms-auto">
                    <a
                      href={beatmap.url}
                      target="blank"
                      className="px-2 py-1 text-sm transition rounded ms-auto hover:bg-slate-600"
                    >
                      Website
                    </a>
                    <a
                      className="px-2 py-1 text-sm transition rounded ms-auto hover:bg-slate-600"
                      href={`osu://b/${beatmap.id}`}
                    >
                      Direct
                    </a>
                    <div
                      ref={clipboardRef}
                      className="p-2 transition rounded cursor-pointer hover:bg-slate-600"
                      onClick={() => {
                        navigator.clipboard.writeText(beatmap.id.toString());
                        setShowCopiedToClipboard(true);
                        setTimeout(() => setShowCopiedToClipboard(false), 1000);
                      }}
                    >
                      <Clipboard size={12} />
                    </div>
                    {/* <Overlay
                      target={clipboardRef.current}
                      show={showCopiedToClipboard}
                      placement="top"
                    >
                      {(props) => (
                        <Tooltip id="overlay-example" {...props}>
                          copied beatmap ID!
                        </Tooltip>
                      )}
                    </Overlay> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function DifficultyBadge({ stars }) {
  return (
    <div
      className="py-1 text-xs text-center rounded"
      style={{ minWidth: "64px", backgroundColor: starToColor(stars) }}
    >
      {stars.toFixed(2)} ★
    </div>
  );
}
