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
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { Progress } from '@/components/shadcn/progress';
import { isMatching, match, P } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { Filter, Plus, StopCircle, X } from 'react-bootstrap-icons';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';

const downloadPatterns = {
  cancelled: isMatching({ cancelled: true }),
  queued: isMatching({
    cancelled: false,
    status: P.union(Status.Pending, Status.CheckingLocalFiles, Status.Queued, Status.Fetching, Status.Fetched),
  }),
  downloading: isMatching({
    cancelled: false,
    status: P.union(Status.StartingDownload, Status.Downloading),
  }),
  completed: isMatching({
    status: P.union(Status.AlreadyDownloaded, Status.AlreadyInstalled, Status.Completed),
  }),
  failed: isMatching({ status: Status.Failed }),
};

export default function ElectronDownloads() {
  const isElectron = useClientValue(() => Boolean(window.ipc), false);
  const [downloadDirectory, setDownloadDirectory] = useState<string | undefined>();
  useEffect(() => {
    window.ipc?.getDownloadDirectory().then(setDownloadDirectory);
  }, []);

  const { data: _downloads, mutate } = useSWR(window.ipc && Channel.GetDownloads, window.ipc?.getDownloads, {
    refreshInterval: 2000,
  });
  const downloads = useMemo(() => _downloads ?? [], [_downloads]);
  const statusCounts = {
    all: downloads?.length,
    cancelled: downloads?.filter(downloadPatterns.cancelled).length,
    queued: downloads?.filter(downloadPatterns.queued).length,
    downloading: downloads?.filter(downloadPatterns.downloading).length,
    completed: downloads?.filter(downloadPatterns.completed).length,
    failed: downloads?.filter(downloadPatterns.failed).length,
  };

  const columns = React.useMemo<ColumnDef<Download>[]>(
    () => [
      {
        accessorKey: 'filename',
        header: 'Name',
        meta: { className: 'min-h-[56px] flex-[2]' },
        enableColumnFilter: false,
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
            <div className='flex min-h-[36px] items-center'>
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
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        enableSorting: false,
        enableColumnFilter: true,
        meta: { filterVariant: 'select' },
        filterFn: (row, _, value: 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled' | undefined) => {
          if (!value) return true;
          return match(value)
            .with('cancelled', () => downloadPatterns.cancelled(row.original))
            .with('queued', () => downloadPatterns.queued(row.original))
            .with('downloading', () => downloadPatterns.downloading(row.original))
            .with('completed', () => downloadPatterns.completed(row.original))
            .with('failed', () => downloadPatterns.failed(row.original))
            .exhaustive();
        },
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
                      <DialogDescription className='max-h-[calc(100vh-200px)] overflow-y-auto whitespace-pre-wrap break-all'>
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
        enableSorting: false,
        enableColumnFilter: false,
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
        accessorFn: (download) => (download as DownloadType[Status.Downloading]).size?.total,
        sortUndefined: 'last',
        enableSorting: true,
        enableColumnFilter: false,
        size: 100,
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
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        cell: ({ row }) => {
          const beatmapsetId = row.original.beatmapsetId;
          const button = (channel: Channel, icon: React.ReactNode) => (
            <Button
              key={channel}
              variant='outline'
              size='icon'
              className='bg-slate-900 text-slate-400 hover:bg-slate-700/40'
              onClick={() => tryCatch(mutate((window.ipc[channel] as any)(beatmapsetId).then(window.ipc.getDownloads)))}
            >
              {icon}
            </Button>
          );

          const clearButton = button(Channel.ClearDownload, <X className='h-5 w-5 text-red-400' />);
          const cancelButton = button(Channel.CancelDownload, <X className='h-5 w-5' />);
          const stopButton = button(Channel.CancelDownload, <StopCircle className='text-red-400' />);
          const retryButton = button(Channel.RetryDownload, <RefreshCw className='h-4 w-4 text-yellow-200' />);
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
          return <div className='flex w-full items-center justify-center gap-1'>{visibleButtons}</div>;
        },
      },
    ],
    [mutate],
  );

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: downloads,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const showStopAllButton = downloads.some((d) => !d.cancelled && !finalizedStatuses.includes(d.status));

  const buttonProps: ButtonProps = {
    size: 'sm',
    variant: 'outline',
    className: 'text-slate-400 hover:bg-slate-500/30',
  };
  return (
    <div className='flex h-full flex-col gap-2 p-4'>
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
            icon={<StopCircle className='mr-2 text-red-400 transition-colors group-hover:text-white' />}
          >
            Stop all
          </Button>
        )}
        {Object.values(statusCounts).some((count) => count > 0) && (
          <>
            {statusChip('cancelled', statusCounts.cancelled, () =>
              mutate(window.ipc.clearCancelledDownloads().then(window.ipc.getDownloads)),
            )}
            {statusChip('failed', statusCounts.failed, () =>
              mutate(window.ipc.clearFailedDownloads().then(window.ipc.getDownloads)),
            )}
            {statusChip('completed', statusCounts.completed, () =>
              mutate(window.ipc.clearCompletedDownloads().then(window.ipc.getDownloads)),
            )}
            {statusChip('downloading', statusCounts.downloading)}
            {statusChip('queued', statusCounts.queued)}
          </>
        )}
      </div>

      <div ref={tableContainerRef} className='relative h-full w-full overflow-auto'>
        <table className='grid rounded-lg'>
          <TableHeader className='sticky top-0 z-[1] grid rounded-t bg-slate-900/80 p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-md'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='flex w-full !border-b-0 hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      'flex items-center',
                      (header.column.getCanSort() || header.column.getCanFilter()) &&
                        'cursor-pointer select-none rounded-lg transition-colors hover:bg-slate-600/50',
                      header.column.getCanFilter() && 'px-0',
                      (header.column.columnDef as any).meta?.className,
                      '!min-h-0',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <StatusFilter column={header.column} statusCounts={statusCounts}>
                      <div
                        className={cn(
                          'flex h-full w-full items-center',
                          header.column.getCanFilter() && 'px-4',
                          !!header.column.getFilterValue() && 'text-yellow-400',
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {match(header.column.getIsSorted())
                          .with('asc', () => <ChevronUp className='ml-2 h-4 w-4' />)
                          .with('desc', () => <ChevronDown className='ml-2 h-4 w-4' />)
                          .otherwise(() => null)}
                        {!!header.column.getFilterValue() && <Filter className='ml-2 h-4 w-4' />}
                      </div>
                    </StatusFilter>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {isElectron && downloads?.length ? (
            <VirtualizedTableBody table={table} tableContainerRef={tableContainerRef} />
          ) : (
            <TableBody className='col-span-full flex'>
              <TableRow className='flex w-full'>
                <TableCell className='w-full text-center text-slate-400'>
                  <Button
                    onClick={() => window.ipc.openLinkInBrowser('https://osucollector.com/all?tutorial=true')}
                    className='w-full rounded-xl border border-4 border-dashed border-teal-600 p-10 text-3xl text-white'
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
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
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
    <TableBody className='relative grid' style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
  // poll download at higher frequency
  const { data: download } = useSWR(
    window.ipc && [Channel.GetDownloadByBeatmapsetId, row.original.beatmapsetId],
    ([_, beatmapsetId]) => window.ipc?.getDownloadByBeatmapsetId(beatmapsetId),
    { refreshInterval: 150, dedupingInterval: 0 },
  );
  const cells = row.getVisibleCells();
  if (download) {
    for (const cell of cells) {
      cell.row.original = download;
    }
  }
  return (
    <TableRow
      data-index={virtualRow.index} //needed for dynamic row height measurement
      ref={node => {
        rowVirtualizer.measureElement(node);
      }} //measure dynamic row height
      key={row.id}
      className='absolute flex w-full'
      style={{ transform: `translateY(${virtualRow.start}px)` }}
    >
      {cells.map((cell) => (
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

interface FilterProps {
  column: Column<any, unknown>;
  children: React.ReactNode;
  statusCounts: {
    all: number;
    queued: number;
    downloading: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
}
function StatusFilter({ column, children, statusCounts }: FilterProps) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = (column.columnDef.meta as any) ?? {};
  if (!column.getCanFilter()) return children;

  const item = (label: string, value: string | undefined) => {
    const count = statusCounts[value ?? 'all'];
    return (
      <DropdownMenuCheckboxItem
        checked={columnFilterValue?.toString() === value}
        onCheckedChange={() => column.setFilterValue(value)}
        className={cn(!count && 'text-slate-500')}
      >
        {label}
        {!!count && ` (${count})`}
      </DropdownMenuCheckboxItem>
    );
  };
  return match(filterVariant)
    .with('select', () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
          <DropdownMenuGroup>
            {item('All', undefined)}
            {item('Queued', 'queued')}
            {item('Downloading', 'downloading')}
            {item('Completed', 'completed')}
            {item('Failed', 'failed')}
            {item('Cancelled', 'cancelled')}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ))
    .otherwise(() => children);
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
        'flex items-center gap-1 rounded-full border py-1 pl-1 pr-2 shadow-md transition-colors',
        style,
        onClear && 'group cursor-pointer hover:border-red-500 hover:bg-red-500/20 hover:text-red-200',
      )}
      onClick={onClear}
    >
      <div className='relative'>
        <Icon className={cn('h-4 w-4', iconStyle, onClear && 'absolute group-hover:opacity-0')} />
        {onClear && <XCircle className='h-4 w-4 opacity-0 group-hover:opacity-100' />}
      </div>
      <div className='text-xs'>
        {status} {count}
      </div>
    </div>
  );
};

const linkStyle = 'text-xs text-slate-400 line-clamp-1 break-all cursor-pointer hover:text-blue-500 transition-colors';
