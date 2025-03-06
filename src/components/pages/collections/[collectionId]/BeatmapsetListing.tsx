'use client';
import BeatmapsetCard from '@/components/pages/collections/[collectionId]/BeatmapsetCard';
import { groupBeatmapsets } from '@/shared/entities/v1/Beatmap';
import { Provider } from 'jotai';

export interface BeatmapsetListingProps {
  listing: ReturnType<typeof groupBeatmapsets>;
  isLoading?: boolean;
}
export default function BeatmapsetListing({ listing, isLoading }: BeatmapsetListingProps) {
  return (
    <Provider>
      <div
        className='flex flex-col items-stretch gap-y-4 sm:grid sm:gap-x-4 sm:gap-y-0'
        style={{
          paddingTop: '8px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gridAutoRows: '17px',
        }}
      >
        {isLoading && !listing?.length && (
          <div className='w-full py-3 flex justify-center items-center'>Loading...</div>
        )}
        {listing?.map(({ beatmapset, beatmaps }, i) => (
          <BeatmapsetCard key={i} beatmapset={beatmapset} beatmaps={beatmaps} />
        ))}
      </div>
    </Provider>
  );
}
