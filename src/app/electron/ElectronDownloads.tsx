'use client';

import { Download } from '@/app/electron/downloader-types';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { isNotNil } from 'ramda';
import { useEffect, useState } from 'react';

export default function ElectronDownloads() {
  const [beatmapsetId, setBeatmapsetId] = useState<string>('155749');

  const [downloads, setDownloads] = useState<Download[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      window.ipc.getDownloads().then(setDownloads);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex flex-col items-start gap-4 p-4'>
      <h3 className='text-white mb-1'>Downloads</h3>
      <div className='flex items-center gap-2'>
        <Input
          value={beatmapsetId}
          onChange={(e) => setBeatmapsetId(e.target.value)}
          className='w-full'
          placeholder='Enter beatmapset ID'
        />
        <Button
          variant='outline'
          className='text-slate-400 hover:bg-slate-500/30'
          onClick={() => window.ipc.addDownload(Number(beatmapsetId))}
        >
          Add
        </Button>
        <Button
          variant='outline'
          className='text-slate-400 hover:bg-slate-500/30'
          onClick={() => window.ipc.clearDownloads()}
        >
          Clear
        </Button>
      </div>
      {downloads.map((download) => {
        return (
          <div key={download.beatmapsetId} className='flex flex-col gap-1 p-1 rounded bg-slate-700/50'>
            {Object.entries(download)
              .filter(([key, value]) => isNotNil(value))
              .map(([key, value]) => (
                <div key={key} className='px-1 rounded bg-slate-700'>
                  {key}: {value.toString()}
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}
