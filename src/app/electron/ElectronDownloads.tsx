'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { Progress } from '@/components/shadcn/progress';
import { match } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { Plus, StopCircle, X } from 'react-bootstrap-icons';
import {
  CircleEllipsis,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Ban,
  Download as DownloadIcon,
} from 'lucide-react';
import useSWR from 'swr';
import useClientValue from '@/hooks/useClientValue';
import { Channel } from '@/app/electron/ipc-types';
import { tryCatch } from '@/utils/try-catch';

const linkStyle = 'text-xs text-slate-400 line-clamp-1 break-all cursor-pointer hover:text-blue-500 transition-colors';

export default function ElectronDownloads() {
  const isElectron = useClientValue(() => Boolean(window.ipc), false);
  const [downloadDirectory, setDownloadDirectory] = useState<string | undefined>();
  useEffect(() => {
    window.ipc?.getDownloadDirectory().then(setDownloadDirectory);
  }, []);

  const { data: _downloads, mutate } = useSWR(window.ipc && Channel.GetDownloads, window.ipc?.getDownloads, {
    refreshInterval: 2000,
    dedupingInterval: 0,
  });
  const downloads = useMemo(() => _downloads ?? [], [_downloads]);

  const columns = React.useMemo<ColumnDef<Download>[]>(
    () => [
      {
        accessorKey: 'filename',
        header: 'Name',
        meta: { className: 'min-h-[56px] flex-[2]' },
        size: 148,
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
        size: 120,
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
                        <DialogTitle>
                          {statusCode && statusText ? `${statusCode} - ${statusText}` : 'Reason:'}
                        </DialogTitle>
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
        meta: { className: 'flex-[1]' },
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
        size: 120,
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
        size: 100,
        cell: ({ row }) => {
          const beatmapsetId = row.original.beatmapsetId;
          const button = (channel: Channel, icon: React.ReactNode) => (
            <Button
              key={channel}
              variant='outline'
              size='icon'
              className='text-slate-400 bg-slate-900 hover:bg-slate-700/40'
              onClick={() => tryCatch(mutate((window.ipc[channel] as any)(beatmapsetId).then(window.ipc.getDownloads)))}
            >
              {icon}
            </Button>
          );

          const clearButton = button(Channel.ClearDownload, <X className='w-5 h-5 text-red-400' />);
          const cancelButton = button(Channel.CancelDownload, <X className='w-5 h-5' />);
          const stopButton = button(Channel.CancelDownload, <StopCircle className='text-red-400' />);
          const retryButton = button(Channel.RetryDownload, <RefreshCw className='text-yellow-200 w-4 h-4' />);
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
    ],
    [mutate],
  );

  // The virtualizer will need a reference to the scrollable container element
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: downloads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const showStopAllButton = downloads.some((d) => !d.cancelled && !finalizedStatuses.includes(d.status));

  const buttonProps: ButtonProps = {
    size: 'sm',
    variant: 'outline',
    className: 'text-slate-400 hover:bg-slate-500/30',
  };
  return (
    <div className='flex flex-col h-full gap-2 p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          {...buttonProps}
          disabled={!downloadDirectory}
          onClick={() => {
            if (downloadDirectory) window.ipc.revealPath(downloadDirectory);
          }}
        >
          Open Downloads Folder
        </Button>
        {showStopAllButton && (
          <Button
            {...buttonProps}
            onClick={() => mutate(window.ipc.stopAllDownloads().then(window.ipc.getDownloads))}
            icon={<StopCircle className='transition-colors text-red-400 group-hover:text-white mr-2' />}
          >
            Stop all
          </Button>
        )}
        <StatusChips
          downloads={downloads}
          onClearCompleted={() => mutate(window.ipc.clearCompletedDownloads().then(window.ipc.getDownloads))}
          onClearCancelled={() => mutate(window.ipc.clearCancelledDownloads().then(window.ipc.getDownloads))}
          onClearFailed={() => mutate(window.ipc.clearFailedDownloads().then(window.ipc.getDownloads))}
        />
      </div>

      <div ref={tableContainerRef} className='overflow-auto w-full relative h-full'>
        <table className='grid rounded-lg'>
          <TableHeader className='grid rounded-t sticky bg-slate-900/80 backdrop-blur-md p-1 top-0 z-[1] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.1)]'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='flex w-full hover:bg-transparent !border-b-0'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      'flex items-center',
                      header.column.getCanSort() &&
                        'cursor-pointer select-none transition-colors rounded-lg hover:bg-slate-600/50',
                      (header.column.columnDef as any).meta?.className,
                      '!min-h-0',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {match(header.column.getIsSorted())
                      .with('asc', () => <ChevronUp className='ml-2 h-4 w-4' />)
                      .with('desc', () => <ChevronDown className='ml-2 h-4 w-4' />)
                      .otherwise(() => null)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {isElectron && table.getRowModel().rows?.length ? (
            <VirtualizedTableBody table={table} tableContainerRef={tableContainerRef} />
          ) : (
            <TableBody className='flex col-span-full'>
              <TableRow className='flex w-full'>
                <TableCell className='w-full text-center text-slate-400'>
                  <Button
                    onClick={() => window.ipc.openLinkInBrowser('https://osucollector.com/all?tutorial=true')}
                    className='text-3xl text-white w-full p-10 border-dashed border rounded-xl border-4 border-teal-600'
                  >
                    <Plus className='text-6xl' />
                    Click here to add a collection!
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </table>
      </div>
    </div>
  );
}

interface TableBodyProps {
  table: TanstackTable<Download>;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}
function VirtualizedTableBody({ table, tableContainerRef }: TableBodyProps) {
  const { rows } = table.getRowModel();

  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 56, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <TableBody className='grid relative' style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<Download>;
        return (
          <VirtualizedTableBodyRow key={row.id} row={row} virtualRow={virtualRow} rowVirtualizer={rowVirtualizer} />
        );
      })}
    </TableBody>
  );
}

interface VirtualizedTableBodyRowProps {
  row: Row<Download>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}
function VirtualizedTableBodyRow({ row, virtualRow, rowVirtualizer }: VirtualizedTableBodyRowProps) {
  return (
    <TableRow
      data-index={virtualRow.index} //needed for dynamic row height measurement
      ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
      key={row.id}
      className='flex absolute w-full'
      style={{ transform: `translateY(${virtualRow.start}px)` }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cn('flex items-center', (cell.column.columnDef as any).meta?.className)}
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

const statusChip = (
  status: 'cancelled' | 'queued' | 'downloading' | 'completed' | 'failed',
  count: number,
  onClear?: () => void,
) => {
  if (!count) return null;
  const [Icon, iconStyle, style] = match(status)
    .with('cancelled', () => [Ban, 'text-white', 'border-slate-500/50 text-white bg-slate-700/70'])
    .with('queued', () => [CircleEllipsis, 'text-white', 'border-yellow-500/50 text-white bg-yellow-700/70'])
    .with('downloading', () => [DownloadIcon, 'text-white', 'border-blue-500/50 text-white bg-blue-700/70'])
    .with('completed', () => [CheckCircle, 'text-white', 'border-green-500/50 text-white bg-green-700/70'])
    .with('failed', () => [XCircle, 'text-white', 'border-red-500/50 text-white bg-red-700/70'])
    .exhaustive();
  return (
    <div
      className={cn(
        'transition-colors flex items-center pl-1 pr-2 py-1 gap-1 border shadow-md rounded-full',
        style,
        onClear && 'group cursor-pointer hover:bg-red-500/20 hover:border-red-500 hover:text-red-200',
      )}
      onClick={onClear}
    >
      <div className='relative'>
        <Icon className={cn('w-4 h-4', iconStyle, onClear && 'absolute group-hover:opacity-0')} />
        {onClear && <XCircle className='w-4 h-4 opacity-0 group-hover:opacity-100' />}
      </div>
      <div className='text-xs'>
        {status} {count}
      </div>
    </div>
  );
};

interface StatusChipsProps {
  downloads: Download[];
  onClearCompleted: () => void;
  onClearCancelled?: () => void;
  onClearFailed?: () => void;
}
function StatusChips({ downloads, onClearCompleted, onClearCancelled, onClearFailed }: StatusChipsProps) {
  const byStatus = (status: Status | Status[]) => (d: Download) =>
    Array.isArray(status) ? status.includes(d.status) : d.status === status;
  const statusCounts = {
    cancelled: downloads?.filter((d) => d.cancelled).length,
    queued: downloads?.filter(
      (d) =>
        !d.cancelled &&
        [Status.Pending, Status.CheckingLocalFiles, Status.Queued, Status.Fetching, Status.Fetched].includes(d.status),
    ).length,
    downloading: downloads?.filter(
      (d) => !d.cancelled && [Status.StartingDownload, Status.Downloading].includes(d.status),
    ).length,
    completed: downloads?.filter(byStatus([Status.AlreadyInstalled, Status.AlreadyDownloaded, Status.Completed]))
      .length,
    failed: downloads?.filter(byStatus(Status.Failed)).length,
  };

  return (
    Object.values(statusCounts).some((count) => count > 0) && (
      <>
        {statusChip('cancelled', statusCounts.cancelled, onClearCancelled)}
        {statusChip('failed', statusCounts.failed, onClearFailed)}
        {statusChip('completed', statusCounts.completed, onClearCompleted)}
        {statusChip('downloading', statusCounts.downloading)}
        {statusChip('queued', statusCounts.queued)}
      </>
    )
  );
}
