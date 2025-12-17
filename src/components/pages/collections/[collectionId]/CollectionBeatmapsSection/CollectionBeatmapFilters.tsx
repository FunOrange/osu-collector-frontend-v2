import { cn } from '@/utils/shadcn-utils';
import BarGraphStars from '@/components/pages/collections/[collectionId]/BarGraphStars';
import BarGraphBpm from '@/components/pages/collections/[collectionId]/BarGraphBpm';
import { Collection } from '@/shared/entities/v1/Collection';
import useSticky from '@/hooks/useSticky';
import { Slider } from '@/components/shadcn/slider';
import { useState } from 'react';
import { assoc, equals, range } from 'ramda';
import { Search } from 'react-bootstrap-icons';
import useDebouncedFunction from '@/hooks/useDebounce';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
  PaginationProps,
  PaginationLast,
  PaginationFirst,
} from '@/components/shadcn/pagination';
import { screenHeightMinusNavbar } from '@/components/Navbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { match } from 'ts-pattern';

export interface BeatmapFilters {
  search: string;
  stars: [number, number];
  bpm: [number, number];
  status: 'any' | 'ranked' | 'qualified' | 'loved' | 'pending' | 'graveyard';
}

export interface CollectionBeatmapFiltersProps {
  collection: Collection;
  filters: BeatmapFilters;
  setFilters: React.Dispatch<React.SetStateAction<BeatmapFilters>>;
  pagination: PaginationProps;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}
export default function CollectionBeatmapFilters({
  collection,
  filters,
  setFilters,
  pagination,
  setPage,
}: CollectionBeatmapFiltersProps) {
  const { isSticky, ref } = useSticky();

  const className = {
    graphTitle: cn('absolute left-3 top-2', 'font-semibold text-white text-lg'),
    resetButton: cn('absolute right-3 top-2', 'text-red-500 hover:text-red-400 cursor-pointer'),
    graph: cn('transition-all px-6 pb-2 pt-10 h-[130px] rounded-lg', 'lg:h-[160px]'),
  };

  const resetStarFilter = () => {
    setPendingFilters(assoc('stars', [0, 11]));
    setFilters(assoc('stars', [0, 11]));
  };
  const resetBpmFilter = () => {
    setPendingFilters(assoc('bpm', [150, 310]));
    setFilters(assoc('bpm', [150, 310]));
  };

  const [pendingFilters, setPendingFilters] = useState<BeatmapFilters>(filters);
  const setSearch = useDebouncedFunction((search: string) => {
    setFilters(assoc('search', search));
  }, 100);
  const setRankedStatusFilter = (status: BeatmapFilters['status']) => {
    setPendingFilters(assoc('status', status));
    setFilters(assoc('status', status));
  };

  // #region pagination
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  const pagesToRender = range(pagination.page - 1, pagination.page + 2);
  const showPreviousPage = pagination.page > 1;
  const showNextPage = pagination.page < totalPages;
  // #endregion pagination

  return (
    <>
      <div className={cn('grid gap-x-2 gap-y-2 rounded-t-lg sm:grid-cols-2 sm:bg-slate-950/30 sm:p-2 sm:pb-0')}>
        <div className='relative rounded-lg bg-slate-950'>
          <div className={className.graphTitle}>Filter by Star Rating</div>
          <div
            className={cn(equals(filters.stars, [0, 11]) && 'hidden', className.resetButton)}
            onClick={resetStarFilter}
          >
            Reset Filters
          </div>

          <BarGraphStars
            title=''
            collection={collection}
            className={className.graph}
            barClassName='rounded-t-lg'
            filter={pendingFilters.stars}
            onBarClick={(star) => {
              setPendingFilters(assoc('stars', [star, star + 1]));
              setFilters(assoc('stars', [star, star + 1]));
            }}
          />
          <div className='px-5 pb-4'>
            <Slider
              variant='orange'
              min={1}
              max={11}
              step={0.5}
              value={pendingFilters.stars}
              onValueChange={(v) => setPendingFilters(assoc('stars', v))}
              onValueCommit={(v) => setFilters(assoc('stars', v))}
            />
          </div>
        </div>

        <div className='relative rounded-lg bg-slate-950'>
          <div className={className.graphTitle}>Filter by BPM</div>
          <div
            className={cn(equals(filters.bpm, [150, 310]) && 'hidden', className.resetButton)}
            onClick={resetBpmFilter}
          >
            Reset Filters
          </div>

          <BarGraphBpm
            title=''
            collection={collection}
            className={className.graph}
            barClassName='rounded-t-md'
            filter={pendingFilters.bpm}
            onBarClick={(bpm) => {
              setPendingFilters(assoc('bpm', [bpm, bpm + 10]));
              setFilters(assoc('bpm', [bpm, bpm + 10]));
            }}
          />
          <div className='px-5 pb-4'>
            <Slider
              variant='sky'
              min={150}
              max={310}
              step={10}
              value={pendingFilters.bpm}
              onValueChange={(v) => setPendingFilters(assoc('bpm', v))}
              onValueCommit={(v) => setFilters(assoc('bpm', v))}
            />
          </div>
        </div>
      </div>
      <div ref={ref} className='sticky top-0 z-20'>
        {totalPages >= 2 && (
          <div className={`absolute w-full ${screenHeightMinusNavbar} pointer-events-none flex flex-col justify-end`}>
            <div className='pointer-events-auto flex w-full flex-col gap-y-2 rounded-lg bg-slate-950/80 px-4 pb-2 pt-4 backdrop-blur-sm'>
              <Slider
                variant='white'
                min={1}
                max={totalPages}
                step={1}
                value={[pagination.page]}
                onValueChange={(v) => setPage(v[0])}
              />
              <Pagination>
                <PaginationContent>
                  <PaginationItem
                    className={cn(
                      'hidden transition-[opacity] sm:block',
                      !showPreviousPage && 'pointer-events-none opacity-20',
                    )}
                  >
                    <PaginationFirst onClick={() => setPage(1)} />
                  </PaginationItem>

                  <PaginationItem
                    className={cn('transition-[opacity]', !showPreviousPage && 'pointer-events-none opacity-20')}
                  >
                    <PaginationPrevious onClick={() => setPage((prev) => prev - 1)} />
                  </PaginationItem>

                  {pagesToRender.map((page) => (
                    <PaginationItem key={page} className={cn((page < 1 || page > totalPages) && 'invisible')}>
                      <PaginationButton isActive={page !== pagination.page} onClick={() => setPage(page)} size='icon'>
                        {page}
                      </PaginationButton>
                    </PaginationItem>
                  ))}

                  <PaginationItem
                    className={cn('transition-[opacity]', !showNextPage && 'pointer-events-none opacity-20')}
                  >
                    <PaginationNext onClick={() => setPage((prev) => prev + 1)} />
                  </PaginationItem>

                  <PaginationItem
                    className={cn(
                      'hidden transition-[opacity] sm:block',
                      !showNextPage && 'pointer-events-none opacity-20',
                    )}
                  >
                    <PaginationLast onClick={() => setPage(totalPages)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
        <div
          className={cn(
            'gap-x-2 gap-y-2 p-2 sm:bg-slate-950/30 lg:gap-x-4',
            'flex items-center',
            isSticky && 'rounded-b-lg bg-slate-950/30 backdrop-blur-sm',
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className='ml-2 hidden h-full cursor-pointer whitespace-nowrap rounded bg-pink-600 px-3 py-1 text-sm transition hover:bg-pink-500 hover:shadow-xl sm:flex'
            >
              <span>
                {match(filters.status)
                  .with('any', () => 'All maps')
                  .with('ranked', () => 'Ranked')
                  .with('qualified', () => 'Qualified')
                  .with('loved', () => 'Loved')
                  .with('pending', () => 'Pending')
                  .with('graveyard', () => 'Graveyard')
                  .exhaustive()}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount sideOffset={0}>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('any')}>All maps</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('ranked')}>Ranked</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('qualified')}>Qualified</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('loved')}>Loved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRankedStatusFilter('graveyard')}>Graveyard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='relative w-full'>
            <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4'>
              <Search size={20} color='currentColor' />
            </div>
            <input
              className='text w-full rounded-full border border-slate-900 bg-slate-950 px-2 py-2 pl-11 ring-offset-background placeholder:text-muted-foreground'
              placeholder='Search beatmaps...'
              value={pendingFilters.search}
              onChange={(e) => {
                setPendingFilters(assoc('search', e.target.value));
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
