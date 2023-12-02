/* eslint-disable no-unused-vars */
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import previewBeatmaps from "@/utils/downloadPreviewBeatmaps.json";
import { Button } from "@/components/shadcn/button";
import Image from "next/image";
import Link from "next/link";
import { getRandomFromArray } from "@/utils/array-utils";
import { Progress } from "@/components/shadcn/progress";
import { DialogClose } from "@radix-ui/react-dialog";

enum DownloadStates {
  NotStarted = "Starting download...",
  Downloading = "Downloading...",
  Finished = "Finished",
  Cancelled = "Cancelled",
  Failed = "Failed",
}

function DownloadPreviewModal({ collection }) {
  // simulate downloads
  const [collectionDownloads, setCollectionDownloads] = useState([
    new CollectionDownload(collection),
  ]);
  const intervalRef = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(simulateDownload, 200);
    return () => clearInterval(intervalRef.current);
  });
  const simulateDownload = () => {
    // progress currently downloading beatmapset
    setCollectionDownloads((prev) => {
      const _collectionDownloads = [...prev];
      const collectionDownload = collectionDownloads[0];
      let currentBeatmapset = collectionDownload.beatmapsets.find(
        (beatmapset) => beatmapset.downloadStatus === DownloadStates.Downloading
      );
      if (!currentBeatmapset) {
        currentBeatmapset = collectionDownload.beatmapsets.find(
          (beatmapset) => beatmapset.downloadStatus === DownloadStates.NotStarted
        );
        if (currentBeatmapset) {
          currentBeatmapset.downloadStatus = DownloadStates.Downloading;
          const randomBeatmap = getRandomFromArray(previewBeatmaps);
          currentBeatmapset.url = `https://osz-dl.nyc3.cdn.digitaloceanspaces.com/${encodeURIComponent(
            `${randomBeatmap.beatmapset.id} ${randomBeatmap.beatmapset.artist} - ${randomBeatmap.beatmapset.title}`
          )}`;
          currentBeatmapset.filename = `${randomBeatmap.beatmapset.id} ${randomBeatmap.beatmapset.artist} - ${randomBeatmap.beatmapset.title}`;
        }
      }
      if (currentBeatmapset) {
        currentBeatmapset.bytesReceived = Math.min(
          currentBeatmapset.bytesReceived + 1.6 * 1e6,
          currentBeatmapset.bytesTotal
        );
        if (currentBeatmapset.bytesReceived >= currentBeatmapset.bytesTotal) {
          currentBeatmapset.downloadStatus = DownloadStates.Finished;
        }
      } else {
        collectionDownload.downloadStatus = DownloadStates.Finished;
      }
      return _collectionDownloads;
    });
  };

  // https://i.imgur.com/optYWti.png
  const collections = collectionDownloads?.map((collectionDownload, index) => (
    <CollectionDownloadCard key={index} collectionDownload={collectionDownload} />
  ));

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Downloads (preview)</DialogTitle>
      </DialogHeader>
      <PreviewOverlay>
        <div className="horizontalStrip">
          <h3>You are previewing an osu!Collector Desktop feature!</h3>
          <div className="flex gap-3">
            <DialogClose>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Link href="/client">
              <Button>Get osu!Collector Desktop</Button>
            </Link>
          </div>
        </div>
      </PreviewOverlay>
      <DialogDescription style={{ height: "80vh", overflow: "hidden" }}>
        <div>osu! should automatically open all .osz files once they are finished downloading.</div>
        <div className="mb-3">
          If it doesn&apos;t, you may need to press F5 at the song select screen.
        </div>
        {collections.length > 0 ? (
          collections
        ) : (
          <div className="py-4">
            <h5 className="text-center text-secondary">No downloads</h5>
          </div>
        )}
      </DialogDescription>
    </DialogContent>
  );
}

function CollectionDownloadCard({ collectionDownload }) {
  const totalBeatmapsets = collectionDownload.beatmapsets?.length;
  const finishedDownloads = collectionDownload.beatmapsets?.filter(
    (mapset) => mapset.downloadStatus === DownloadStates.Finished
  ).length;
  const visibleDownloads = collectionDownload.beatmapsets?.filter(
    (mapset) =>
      mapset.downloadStatus !== DownloadStates.NotStarted &&
      mapset.downloadStatus !== DownloadStates.Cancelled
  );
  const statusText =
    collectionDownload.downloadStatus === DownloadStates.NotStarted
      ? "Pending..."
      : collectionDownload.downloadStatus === DownloadStates.Downloading
      ? `Downloading: ${visibleDownloads.length} of ${totalBeatmapsets}`
      : collectionDownload.downloadStatus === DownloadStates.Finished
      ? `Downloaded ${finishedDownloads} of ${totalBeatmapsets}`
      : collectionDownload.downloadStatus === DownloadStates.Cancelled
      ? `Downloaded ${finishedDownloads} of ${totalBeatmapsets}`
      : "";
  const inProgress =
    collectionDownload.downloadStatus !== DownloadStates.Finished &&
    collectionDownload.downloadStatus !== DownloadStates.Cancelled;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="px-0">
          <h5 className="mb-0 text-lg text-slate-100">
            {collectionDownload.uploader && collectionDownload.uploader + " - "}
            {collectionDownload.name}
          </h5>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">{statusText}</div>
          <div className="pr-0">
            <Button className="align-middle" variant="outline" size="sm">
              {inProgress ? "Stop all" : "Clear"}
            </Button>
          </div>
        </div>
      </div>
      {visibleDownloads?.map((mapset) => (
        <BeatmapsetDownloadCard key={mapset.id} mapsetDownload={mapset} />
      ))}
    </div>
  );
}

function BeatmapsetDownloadCard({ mapsetDownload }) {
  const [showError, setShowError] = useState(false);

  const megaBytesReceived = mapsetDownload.bytesReceived / 1000000;
  const megaBytesTotal = mapsetDownload.bytesTotal / 1000000;
  const progress = 100 * (mapsetDownload.bytesReceived / mapsetDownload.bytesTotal);

  return (
    <div className="my-1">
      <div className="flex items-center rounded bg-slate-700">
        <div>
          <Image className="py-2 mx-2" src="/icons/osz.png" alt="osz" width={32} height={32} />
        </div>
        <div className="w-full px-2 py-2 border-l border-l-slate-600">
          <p className="mb-0">{mapsetDownload.filename}</p>
          {mapsetDownload.downloadStatus === DownloadStates.Downloading && (
            <>
              <p className="text-slate-500" style={{ fontSize: 13 }}>
                {megaBytesReceived.toFixed(1)} MB of {megaBytesTotal.toFixed(1)} MB (
                {Math.round(progress) || 0}%)
              </p>
              <div className="mb-1 text-xs truncate text-slate-500">{mapsetDownload.url}</div>
              <Progress value={progress} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

class CollectionDownload {
  collectionId;
  uploader;
  name;
  downloadStatus;
  beatmapsets;
  cancelTokens;
  url;
  errorMessage;
  constructor(collection) {
    this.collectionId = collection.id;
    this.uploader = collection.uploader.username;
    this.name = collection.name;
    this.downloadStatus = DownloadStates.Downloading;
    this.beatmapsets = collection.beatmapsets.map((beatmapset) => ({
      id: beatmapset.id,
      beatmaps: beatmapset.beatmaps,
      downloadStatus: DownloadStates.NotStarted,
      bytesReceived: 0,
      bytesTotal: 5e6 + Math.random() * 5e6,
      downloadLocation: "",
    }));
    this.cancelTokens = new Map();
    this.url = "";
    this.errorMessage = undefined;
  }

  getBeatmapsetsNotStarted() {
    return this.beatmapsets.filter(
      (beatmapset) => beatmapset.downloadStatus === DownloadStates.NotStarted
    );
  }
}

const PreviewOverlay = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2;
  backdrop-filter: blur(1px);
  .horizontalStrip {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 160px;
    color: white;
    /* background: linear-gradient(
      0deg,
      rgba(2, 0, 36, 0) 0%,
      rgba(0, 0, 0, 0.8015581232492998) 20%,
      rgba(0, 0, 0, 0.8) 80%,
      rgba(0, 0, 0, 0) 100%
    ); */
    background-color: rgba(0, 0, 0, 0.8);
    -webkit-box-shadow: 0px 0px 15px 5px #000;
    box-shadow: 0px 0px 15px 5px #000;
  }
`;

export default DownloadPreviewModal;
