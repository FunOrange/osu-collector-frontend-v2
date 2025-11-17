'use client';

import { Download, DownloadType, finalizedStatuses, Status } from '@/app/electron/downloader-types';
import { Button, ButtonProps } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { Progress } from '@/components/shadcn/progress';
import { match } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { Plus, StopCircle, X } from 'react-bootstrap-icons';
import { CircleEllipsis, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/shadcn/skeleton';
import useSWR, { mutate } from 'swr';
import useClientValue from '@/hooks/useClientValue';
import { Channel } from '@/app/electron/ipc-types';
import { tryCatch } from '@/utils/try-catch';
import { swrKeyIncludes } from '@/utils/swr-utils';
import React, { useEffect, useState } from 'react';
import { equals } from 'ramda';

export default function ElectronDownloads() {
  const isElectron = useClientValue(() => Boolean(window.ipc), false);
  const [downloadDirectory, setDownloadDirectory] = useState<string | undefined>();
  useEffect(() => {
    window.ipc?.getDownloadDirectory().then(setDownloadDirectory);
  }, []);

  const {
    data: _downloads,
    isLoading,
    mutate,
  } = useSWR(window.ipc && Channel.GetDownloads, window.ipc?.getDownloads, {
    refreshInterval: 150,
    dedupingInterval: 0,
  });
  const downloads = _downloads ?? [];

  const table = useReactTable({
    data: downloads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const showStopAllButton = downloads.some((d) => !d.cancelled && !finalizedStatuses.includes(d.status));
  const hasCompletedDownloads = downloads.some((d) => d.status === Status.Completed);
  const hasInactiveDownloads = downloads.some(
    (d) => d.cancelled || [Status.AlreadyDownloaded, Status.AlreadyInstalled].includes(d.status),
  );

  return (
    <div className='flex flex-col items-start gap-2 p-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          className='text-slate-400 hover:bg-slate-500/30'
          disabled={!downloadDirectory}
          onClick={() => {
            if (downloadDirectory) window.ipc.revealPath(downloadDirectory);
          }}
        >
          Open Downloads Folder
        </Button>
        {showStopAllButton && (
          <Button
            variant='outline'
            className='text-red-400 group hover:bg-slate-500/30'
            onClick={() => mutate(window.ipc.stopAllDownloads().then(window.ipc.getDownloads))}
            icon={<StopCircle className='transition-colors text-red-400 group-hover:text-white mr-2' />}
          >
            Stop all
          </Button>
        )}
        {hasInactiveDownloads && (
          <Button
            variant='outline'
            className='text-slate-400 hover:bg-slate-500/30'
            onClick={() => mutate(window.ipc.clearInactiveDownloads().then(window.ipc.getDownloads))}
          >
            Clear Inactive
          </Button>
        )}
        {hasCompletedDownloads && (
          <Button
            variant='outline'
            className='text-slate-400 hover:bg-slate-500/30'
            onClick={() => mutate(window.ipc.clearCompletedDownloads().then(window.ipc.getDownloads))}
          >
            Clear Completed
          </Button>
        )}
      </div>

      <StatusChips downloads={downloads} />

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
              table.getRowModel().rows.map((row) => <DownloadRow key={row.original.beatmapsetId} row={row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-slate-400'>
                  <Button
                    onClick={() => window.ipc.openLinkInBrowser('https://osucollector.com/all?tutorial=true')}
                    className='text-3xl text-white w-full p-10'
                  >
                    <Plus className='text-6xl' />
                    Click here to add a collection!
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Skeleton>
    </div>
  );
}

const statusChip = (status: 'queued' | 'downloading' | 'completed' | 'failed', count: number) => {
  if (!count) return null;
  const [Icon, iconStyle, style] = match(status)
    .with('queued', () => [CircleEllipsis, 'text-white', 'border-yellow-500/50 text-white bg-yellow-700/70'])
    .with('downloading', () => [XCircle, 'text-white', 'border-blue-500/50 text-white bg-blue-700/70'])
    .with('completed', () => [CheckCircle, 'text-white', 'border-green-500/50 text-white bg-green-700/70'])
    .with('failed', () => [XCircle, 'text-white', 'border-red-500/50 text-white bg-red-700/70'])
    .exhaustive();
  return (
    <div className={cn('flex items-center pl-1 pr-2 py-1 gap-1 border shadow-md rounded-full', style)}>
      <Icon className={cn('w-4 h-4', iconStyle)} />
      <div className='text-xs'>
        {status} {count}
      </div>
    </div>
  );
};

const linkStyle = 'text-xs text-slate-400 line-clamp-1 break-all cursor-pointer hover:text-blue-500 transition-colors';

const columns: ColumnDef<Download>[] = [
  {
    accessorKey: 'filename',
    header: 'Name',
    meta: { className: 'w-full min-w-[148px]' },
    cell: ({ row }) => {
      const osuwebUrl = `https://osu.ppy.sh/beatmapsets/${row.original.beatmapsetId}`;
      const [name, outputPath, link] = match(row.original)
        .with({ status: Status.Pending }, (d) => [null, null, osuwebUrl])
        .with({ status: Status.CheckingLocalFiles }, (d) => [null, null, osuwebUrl])
        .with({ status: Status.AlreadyInstalled }, (d) => [null, d.installLocation])
        .with({ status: Status.AlreadyDownloaded }, (d) => [null, d.downloadPath])
        .with({ status: Status.Queued }, (d) => [null, null, osuwebUrl])
        .with({ status: Status.Fetching }, (d) => [null, null, osuwebUrl])
        .with({ status: Status.Fetched }, (d) => [d.filename, null])
        .with({ status: Status.StartingDownload }, (d) => [d.filename, null])
        .with({ status: Status.Downloading }, (d) => [d.filename, d.outputPath])
        .with({ status: Status.Completed }, (d) => [d.filename, d.outputPath])
        .with({ status: Status.Failed }, (d) => [d.filename, d.outputPath, !d.outputPath ? osuwebUrl : null])
        .otherwise(() => []);
      const download = row.original as DownloadType[Status.Downloading];
      return (
        <div className='flex items-center min-h-[36px]'>
          <div>
            <div className='line-clamp-1 break-all'>{name}</div>
            {outputPath && (
              <div className={linkStyle} onClick={() => window.ipc.revealPath(download.downloadDirectory)}>
                {outputPath}
              </div>
            )}
            {link && (
              <div className={linkStyle} onClick={() => window.ipc.openLinkInBrowser(link)}>
                {link}
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
        .with({ status: Status.AlreadyDownloaded }, () => <div className='text-xs'>Already downloaded</div>)
        .with({ status: Status.AlreadyInstalled }, () => <div className='text-xs'>Already installed</div>)
        .with({ status: Status.Queued }, () => 'Queued')
        .with({ status: Status.Fetching }, () => 'Fetching')
        .with({ status: Status.Fetched }, () => 'Fetched')
        .with({ status: Status.StartingDownload }, () => <div className='text-xs'>Starting download</div>)
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
                  <DialogDescription className='whitespace-pre-wrap break-all overflow-y-auto max-h-[calc(100vh-200px)]'>
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
      const beatmapsetId = row.original.beatmapsetId;
      const props: ButtonProps = {
        variant: 'outline',
        size: 'icon',
        className: 'text-slate-400 bg-slate-900 hover:bg-slate-700/40',
      };
      const mutateDownloads = () => mutate(swrKeyIncludes(Channel.GetDownloads));
      const clearButton = (
        <Button
          {...props}
          key='cancel-btn'
          onClick={() => window.ipc.clearDownload(beatmapsetId).then(mutateDownloads)}
        >
          <X className='w-5 h-5 text-red-400' />
        </Button>
      );
      const cancelButton = (
        <Button
          {...props}
          key='cancel-btn'
          onClick={() => window.ipc.cancelDownload(beatmapsetId).then(mutateDownloads)}
        >
          <X className='w-5 h-5' />
        </Button>
      );
      const stopButton = (
        <Button {...props} key='stop-btn' onClick={() => window.ipc.cancelDownload(beatmapsetId).then(mutateDownloads)}>
          <StopCircle className='text-red-400' />
        </Button>
      );
      const retryButton = (
        <Button
          {...props}
          key='retry-btn'
          onClick={() => tryCatch(window.ipc.retryDownload(beatmapsetId).then(mutateDownloads))}
        >
          <RefreshCw className='text-yellow-200 w-4 h-4' />
        </Button>
      );
      const visibleButtons = row.original.cancelled
        ? [retryButton, clearButton]
        : match(row.original.status)
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
            .with(Status.Failed, () => [retryButton, clearButton])
            .exhaustive();
      return <div className='w-full flex justify-center items-center gap-1'>{visibleButtons}</div>;
    },
  },
];

function StatusChips({ downloads }: { downloads: Download[] }) {
  const byStatus = (status: Status) => (d: Download) => d.status === status;
  const statusCounts = {
    queued: downloads?.filter(
      (d) =>
        !d.cancelled &&
        [Status.Pending, Status.CheckingLocalFiles, Status.Queued, Status.Fetching, Status.Fetched].includes(d.status),
    ).length,
    downloading: downloads?.filter(
      (d) => !d.cancelled && [Status.StartingDownload, Status.Downloading].includes(d.status),
    ).length,
    completed: downloads?.filter(byStatus(Status.Completed)).length,
    failed: downloads?.filter(byStatus(Status.Failed)).length,
  };

  return (
    Object.values(statusCounts).some((count) => count > 0) && (
      <div className='flex items-center gap-2'>
        {statusChip('failed', statusCounts.failed)}
        {statusChip('completed', statusCounts.completed)}
        {statusChip('downloading', statusCounts.downloading)}
        {statusChip('queued', statusCounts.queued)}
      </div>
    )
  );
}

function _DownloadRow({ row }: { row: Row<Download> }) {
  return (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
const DownloadRow = React.memo(_DownloadRow, (a, b) => equals(a.row.original, b.row.original));
