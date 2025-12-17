'use client';
/* eslint-disable no-unused-vars */
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { useEffect, useRef, useState } from 'react';
import previewBeatmaps from '@/utils/downloadPreviewBeatmaps.json';
import { Button } from '@/components/shadcn/button';
import Image from 'next/image';
import { getRandomFromArray } from '@/utils/array-utils';
import { Progress } from '@/components/shadcn/progress';
import { Collection } from '@/shared/entities/v1/Collection';
import DesktopFeaturePreviewOverlay from '@/components/DesktopFeaturePreviewOverlay';
import useSWR from 'swr';
import { endpoints } from '@/shared/endpoints';
import axios from 'axios';
import { Beatmap } from '@/shared/entities/v2/Beatmap';
import { Beatmapset } from '@/shared/entities/v2/Beatmapset';

enum DownloadStates {
  NotStarted = 'Starting download...',
  Downloading = 'Downloading...',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
}

export interface DownloadPreviewModalProps {
  collection: Collection;
  open: boolean;
  close: () => void;
}
function DownloadPreviewModal({ collection, open, close }: DownloadPreviewModalProps) {
  // simulate downloads
  const [collectionDownloads, setCollectionDownloads] = useState([new CollectionDownload(collection)]);
  const v3 = useSWR(open && endpoints.collections.id(collection.id).beatmapsv3.GET, (url) =>
    axios.get<{ beatmaps: Beatmap[]; beatmapsets: Beatmapset[] }>(url).then((res) => res.data),
  );
  useEffect(() => {
    const beatmapsets = v3.data?.beatmapsets;
    setCollectionDownloads([
      new CollectionDownload({
        ...collection,
        beatmapsets: beatmapsets?.map(({ id }) => ({ id })) ?? [],
      }),
    ]);
  }, [collection, v3.data?.beatmapsets]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (open && v3.data?.beatmapsets) {
      collectionDownloads[0].reset(collection);
      intervalRef.current = setInterval(simulateDownload, 200);
    }
    return () => clearInterval(intervalRef.current!);
  }, [open, v3.data?.beatmapsets]);
  const simulateDownload = () => {
    // progress currently downloading beatmapset
    setCollectionDownloads((prev) => {
      const _collectionDownloads = [...prev];
      const collectionDownload = prev[0];
      let currentBeatmapset = collectionDownload.beatmapsets.find(
        (beatmapset) => beatmapset.downloadStatus === DownloadStates.Downloading,
      );
      if (!currentBeatmapset) {
        currentBeatmapset = collectionDownload.beatmapsets.find(
          (beatmapset) => beatmapset.downloadStatus === DownloadStates.NotStarted,
        );
        if (currentBeatmapset) {
          currentBeatmapset.downloadStatus = DownloadStates.Downloading;
          const randomBeatmap = getRandomFromArray(previewBeatmaps);
          currentBeatmapset.url = `https://osz-dl.nyc3.cdn.digitaloceanspaces.com/${encodeURIComponent(
            `${randomBeatmap.beatmapset.id} ${randomBeatmap.beatmapset.artist} - ${randomBeatmap.beatmapset.title}`,
          )}`;
          currentBeatmapset.filename = `${randomBeatmap.beatmapset.id} ${randomBeatmap.beatmapset.artist} - ${randomBeatmap.beatmapset.title}`;
        }
      }
      if (currentBeatmapset) {
        currentBeatmapset.bytesReceived = Math.min(
          currentBeatmapset.bytesReceived + 1.6 * 1e6,
          currentBeatmapset.bytesTotal,
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

  const [overlayVisible, setOverlayVisible] = useState(false);
  useEffect(() => {
    if (open && v3.data?.beatmapsets) {
      setOverlayVisible(false);
      setTimeout(() => setOverlayVisible(true), 1000);
    }
  }, [open, v3.data?.beatmapsets]);

  return (
    <DialogContent className='max-w-4xl' onPointerDownOutside={close}>
      <DialogHeader>
        <DialogTitle>Downloads (preview)</DialogTitle>
      </DialogHeader>
      <DesktopFeaturePreviewOverlay visible={overlayVisible} onCancel={close} />
      <DialogDescription style={{ height: '80vh', overflow: 'hidden' }}>
        <div>osu! should automatically open all .osz files once they are finished downloading.</div>
        <div className='mb-3'>If it doesn&apos;t, you may need to press F5 at the song select screen.</div>
        {collections.length > 0 ? (
          collections
        ) : (
          <div className='py-4'>
            <h5 className='text-center text-secondary'>No downloads</h5>
          </div>
        )}
      </DialogDescription>
    </DialogContent>
  );
}

function CollectionDownloadCard({ collectionDownload }) {
  const totalBeatmapsets = collectionDownload.beatmapsets?.length;
  const finishedDownloads = collectionDownload.beatmapsets?.filter(
    (mapset) => mapset.downloadStatus === DownloadStates.Finished,
  ).length;
  const visibleDownloads = collectionDownload.beatmapsets?.filter(
    (mapset) =>
      mapset.downloadStatus !== DownloadStates.NotStarted && mapset.downloadStatus !== DownloadStates.Cancelled,
  );
  const statusText =
    collectionDownload.downloadStatus === DownloadStates.NotStarted
      ? 'Pending...'
      : collectionDownload.downloadStatus === DownloadStates.Downloading
        ? `Downloading: ${visibleDownloads.length} of ${totalBeatmapsets}`
        : collectionDownload.downloadStatus === DownloadStates.Finished
          ? `Downloaded ${finishedDownloads} of ${totalBeatmapsets}`
          : collectionDownload.downloadStatus === DownloadStates.Cancelled
            ? `Downloaded ${finishedDownloads} of ${totalBeatmapsets}`
            : '';
  const inProgress =
    collectionDownload.downloadStatus !== DownloadStates.Finished &&
    collectionDownload.downloadStatus !== DownloadStates.Cancelled;
  return (
    <div>
      <div className='mb-1 flex items-center justify-between'>
        <div className='px-0'>
          <h5 className='mb-0 text-lg text-slate-100'>
            {collectionDownload.uploader && collectionDownload.uploader + ' - '}
            {collectionDownload.name}
          </h5>
        </div>
        <div className='flex items-center gap-4'>
          <div className='text-right'>{statusText}</div>
          <div className='pr-0'>
            <Button className='align-middle' variant='outline' size='sm'>
              {inProgress ? 'Stop all' : 'Clear'}
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
  const megaBytesReceived = mapsetDownload.bytesReceived / 1000000;
  const megaBytesTotal = mapsetDownload.bytesTotal / 1000000;
  const progress = 100 * (mapsetDownload.bytesReceived / mapsetDownload.bytesTotal);

  return (
    <div className='my-1'>
      <div className='flex items-center rounded bg-slate-700'>
        <div>
          <Image className='mx-2 py-2' src='/icons/osz.png' alt='osz' width={32} height={32} />
        </div>
        <div className='w-full border-l border-l-slate-600 px-2 py-2'>
          <p className='mb-0'>{mapsetDownload.filename}</p>
          {mapsetDownload.downloadStatus === DownloadStates.Downloading && (
            <>
              <p className='text-slate-500' style={{ fontSize: 13 }}>
                {megaBytesReceived.toFixed(1)} MB of {megaBytesTotal.toFixed(1)} MB ({Math.round(progress) || 0}%)
              </p>
              <div className='mb-1 truncate text-xs text-slate-500'>{mapsetDownload.url}</div>
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
      downloadLocation: '',
    }));
    this.cancelTokens = new Map();
    this.url = '';
    this.errorMessage = undefined;
  }

  reset(collection) {
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
      downloadLocation: '',
    }));
    this.cancelTokens = new Map();
    this.url = '';
    this.errorMessage = undefined;
  }

  getBeatmapsetsNotStarted() {
    return this.beatmapsets.filter((beatmapset) => beatmapset.downloadStatus === DownloadStates.NotStarted);
  }
}

export default DownloadPreviewModal;
