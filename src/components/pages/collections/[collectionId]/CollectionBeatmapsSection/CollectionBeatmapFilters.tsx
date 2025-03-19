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
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
  PaginationProps,
  PaginationLast,
  PaginationFirst,
} from '@/components/shadcn/pagination';

export interface BeatmapFilters {
  search: string;
  stars: [number, number];
  bpm: [number, number];
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

  // #region pagination
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  const pagesToRender = range(pagination.page - 1, pagination.page + 2);
  const showPreviousPage = pagination.page > 1;
  const showNextPage = pagination.page < totalPages;
  // #endregion pagination

  return (
    <>
      <div className={cn('grid sm:p-2 sm:pb-0 rounded-t-lg sm:grid-cols-2 gap-y-2 gap-x-2 sm:bg-slate-950/30')}>
        <div className='relative bg-slate-950 rounded-lg'>
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
              step={1}
              value={pendingFilters.stars}
              onValueChange={(v) => setPendingFilters(assoc('stars', v))}
              onValueCommit={(v) => setFilters(assoc('stars', v))}
            />
          </div>
        </div>

        <div className='relative bg-slate-950 rounded-lg'>
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

      <div ref={ref} className={cn('sm:sticky top-14 z-20')}>
        {totalPages >= 2 && (
          <div className='absolute w-full h-[calc(100vh-56px)] flex flex-col justify-end pointer-events-none'>
            <div className='w-full px-4 pb-2 pt-4 flex flex-col gap-y-2 bg-slate-950/80 backdrop-blur-sm rounded-lg pointer-events-auto'>
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
                  <PaginationItem className={cn(!showPreviousPage && 'invisible')}>
                    <PaginationFirst onClick={() => setPage(1)} />
                  </PaginationItem>

                  <PaginationItem className={cn(!showPreviousPage && 'invisible')}>
                    <PaginationPrevious onClick={() => setPage((prev) => prev - 1)} />
                  </PaginationItem>

                  {pagesToRender.map((page) => (
                    <PaginationItem key={page} className={cn((page < 1 || page > totalPages) && 'invisible')}>
                      <PaginationButton isActive={page !== pagination.page} onClick={() => setPage(page)} size='icon'>
                        {page}
                      </PaginationButton>
                    </PaginationItem>
                  ))}

                  <PaginationItem className={cn(!showNextPage && 'invisible')}>
                    <PaginationNext onClick={() => setPage((prev) => prev + 1)} />
                  </PaginationItem>

                  <PaginationItem className={cn(!showNextPage && 'invisible')}>
                    <PaginationLast onClick={() => setPage(totalPages)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
        <div
          className={cn(
            'grid py-2 sm:p-2 sm:grid-cols-2 gap-y-2 gap-x-2 lg:gap-x-4 sm:bg-slate-950/30',
            isSticky && 'backdrop-blur-sm rounded-b-lg',
          )}
        >
          <div className='relative col-span-full'>
            <div className='absolute inset-y-0 flex items-center pointer-events-none start-0 ps-4'>
              <Search size={20} />
            </div>
            <input
              className='w-full px-2 py-2 text border rounded-full pl-11 border-slate-900 bg-slate-950 ring-offset-background placeholder:text-muted-foreground'
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
