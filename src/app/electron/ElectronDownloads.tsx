'use client';

import { Download, DownloadType, Status } from '@/app/electron/downloader-types';
import { Button, ButtonProps } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { useState } from 'react';
import { Progress } from '@/components/shadcn/progress';
import { match } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { StopCircle, X } from 'react-bootstrap-icons';
import { RefreshCw } from 'lucide-react';
import useSubmit from '@/hooks/useSubmit';
import { Skeleton } from '@/components/shadcn/skeleton';
import useSWR from 'swr';
import useClientValue from '@/hooks/useClientValue';
import { Channel } from '@/app/electron/ipc-types';

export default function ElectronDownloads() {
  const isElectron = useClientValue(() => Boolean(window.ipc), false);
  const [beatmapsetId, setBeatmapsetId] = useState<string>('155749');

  const {
    data: downloads,
    isLoading,
    mutate,
  } = useSWR(window.ipc && Channel.GetDownloads, window.ipc?.getDownloads, {
    refreshInterval: 160,
    dedupingInterval: 0,
  });

  const table = useReactTable({
    data: downloads ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='flex flex-col items-start gap-4 p-4'>
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
          onClick={() => mutate(window.ipc.clearDownloads().then(window.ipc.getDownloads))}
        >
          Clear
        </Button>
      </div>

      <Skeleton loading={isLoading} className='w-full'>
        <Table className='px-4 py-2 rounded-lg overflow-hidden bg-slate-900/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.1)]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isElectron && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-slate-400'>
                  <div>
                    To get started, browse for collections on{' '}
                    <span
                      className={cn(linkStyle, 'inline text-slate-300 text-sm')}
                      onClick={() => window.ipc.openLinkInBrowser('https://osucollector.com')}
                    >
                      osucollector.com
                    </span>
                  </div>
                  <div>
                    Click the <b className='text-slate-300'>Add to osu!</b> button on a collection or tournament you
                    want to add.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Skeleton>
    </div>
  );
}

const linkStyle = 'text-xs text-slate-400 line-clamp-1 break-all cursor-pointer hover:text-blue-500 transition-colors';

const columns: ColumnDef<Download>[] = [
  {
    accessorKey: 'filename',
    header: 'Name',
    meta: { className: 'w-full min-w-[148px]' },
    cell: ({ row }) => {
      const [name, outputPath] = match(row.original)
        .with({ status: Status.AlreadyInstalled }, (d) => [null, d.installLocation])
        .with({ status: Status.AlreadyDownloaded }, (d) => [null, d.downloadPath])
        .with({ status: Status.Fetched }, (d) => [d.filename, null])
        .with({ status: Status.StartingDownload }, (d) => [d.filename, null])
        .with({ status: Status.Downloading }, (d) => [d.filename, d.outputPath])
        .with({ status: Status.Completed }, (d) => [d.filename, d.outputPath])
        .with({ status: Status.Failed }, (d) => [d.filename, d.outputPath])
        .otherwise(() => []);
      const download = row.original as DownloadType[Status.Downloading];
      return (
        <div className='flex'>
          <div>
            <div className='line-clamp-1 break-all'>{name}</div>
            {outputPath && (
              <div className={linkStyle} onClick={() => window.ipc.revealPath(download.downloadDirectory)}>
                {outputPath}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { className: 'min-w-[94px]' },
    cell: ({ row }) => {
      if (row.original.cancelled) return 'Cancelled';
      return match(row.original)
        .with({ status: Status.Pending }, () => 'Pending')
        .with({ status: Status.CheckingLocalFiles }, () => 'Checking files')
        .with({ status: Status.AlreadyDownloaded }, () => 'Already downloaded')
        .with({ status: Status.AlreadyInstalled }, () => 'Already installed')
        .with({ status: Status.Queued }, () => 'Queued')
        .with({ status: Status.Fetching }, () => 'Fetching')
        .with({ status: Status.Fetched }, () => 'Fetched')
        .with({ status: Status.StartingDownload }, () => 'Starting download')
        .with({ status: Status.Downloading }, () => 'Downloading')
        .with({ status: Status.Completed }, () => 'Completed')
        .with({ status: Status.Failed }, (download) => {
          const split = download.error.split(' - ');
          const statusCode = split[0];
          const statusText = split[1];
          const message = split.slice(2);
          return (
            <div className='flex flex-col'>
              Failed
              <Dialog>
                <DialogTrigger className={cn(linkStyle)}>{download.error}</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{statusCode && statusText ? `${statusCode} - ${statusText}` : 'Reason:'}</DialogTitle>
                  </DialogHeader>
                  <DialogDescription className='whitespace-pre-line break-all overflow-y-auto max-h-[calc(100vh-200px)]'>
                    {message?.join(' - ') || download.error}
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          );
        })
        .exhaustive();
    },
  },
  {
    accessorKey: 'size.downloaded',
    header: 'Progress',
    meta: { className: 'min-w-[calc(20vw)]' },
    cell: ({ row }) => {
      const download = row.original as DownloadType[Status.Downloading];
      const remoteUrl = download.remoteUrl;
      const downloaded = download.size?.downloaded;
      const total = download.size?.total;
      return (
        <div className='flex flex-col gap-1'>
          {remoteUrl && (
            <div className={linkStyle} onClick={() => window.ipc.openLinkInBrowser(remoteUrl)}>
              {remoteUrl}
            </div>
          )}
          <Progress value={(100 * downloaded) / total} max={100} />
        </div>
      );
    },
  },
  {
    accessorKey: 'size.total',
    meta: { className: 'min-w-[90px]' },
    header: 'Size',
    cell: ({ row }) => {
      const size = (row.original as any).size?.total as number;
      const value = size ? `${(size / 1024 / 1024).toFixed(2)} MB` : '';
      return <div className='whitespace-nowrap'>{value}</div>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      if (row.original.cancelled) return;

      const props: ButtonProps = {
        variant: 'outline',
        size: 'icon',
        className: 'text-slate-400 bg-slate-900 hover:bg-slate-700/40',
      };
      const cancelButton = (
        <Button {...props} key='cancel-btn' onClick={() => window.ipc.cancelDownload(row.original.beatmapsetId)}>
          <X />
        </Button>
      );
      const stopButton = (
        <Button {...props} key='stop-btn' onClick={() => window.ipc.cancelDownload(row.original.beatmapsetId)}>
          <StopCircle className='text-red-400' />
        </Button>
      );
      const retryButton = (
        <Button {...props} key='retry-btn' onClick={() => window.ipc.retryDownload(row.original.beatmapsetId)}>
          <RefreshCw className='text-yellow-200 w-4 h-4' />
        </Button>
      );
      const visibleButtons = match(row.original.status)
        .with(Status.Pending, () => [cancelButton])
        .with(Status.CheckingLocalFiles, () => [])
        .with(Status.AlreadyDownloaded, () => [])
        .with(Status.AlreadyInstalled, () => [])
        .with(Status.Queued, () => [cancelButton])
        .with(Status.Fetching, () => [cancelButton])
        .with(Status.Fetched, () => [cancelButton])
        .with(Status.StartingDownload, () => [stopButton])
        .with(Status.Downloading, () => [stopButton])
        .with(Status.Completed, () => [])
        .with(Status.Failed, () => [retryButton])
        .exhaustive();
      return <div className='w-full flex justify-center items-center gap-1'>{visibleButtons}</div>;
    },
  },
];
