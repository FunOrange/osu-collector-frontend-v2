import { cn } from '@/utils/shadcn-utils';
import BarGraphStars from '@/components/pages/collections/[collectionId]/BarGraphStars';
import BarGraphBpm from '@/components/pages/collections/[collectionId]/BarGraphBpm';
import { Collection } from '@/shared/entities/v1/Collection';
import useSticky from '@/hooks/useSticky';

export interface CollectionBeatmapFiltersProps {
  collection: Collection;
}

export default function CollectionBeatmapFilters({ collection }: CollectionBeatmapFiltersProps) {
  const { isSticky, ref } = useSticky();

  const className = {
    graphTitle: cn(
      'absolute left-3 top-3',
      'transition-[opacity] bg-black/30 rounded-xl px-2 font-semibold text-white text-[20px]',
      isSticky && 'sm:opacity-0 sm:pointer-events-none',
    ),
    graph: cn('transition-all px-6 pb-2 pt-5 h-[130px] rounded-lg', isSticky ? 'sm:h-[80px] sm:pt-2' : 'lg:h-[160px] '),
  };

  return (
    <div ref={ref} className={cn('sm:sticky top-16 z-20', 'grid rounded-t sm:grid-cols-2 gap-y-2 gap-x-2 lg:gap-x-4')}>
      <div className='relative bg-slate-950 rounded-lg'>
        <div className={className.graphTitle}>Star Rating</div>

        <BarGraphStars title='' collection={collection} className={className.graph} barClassName='rounded-t-lg' />
      </div>
      <div className='relative bg-slate-950 rounded-lg'>
        <div className={className.graphTitle}>BPM</div>

        <BarGraphBpm title='' collection={collection} className={className.graph} barClassName='rounded-t-md' />
      </div>
    </div>
  );
}
