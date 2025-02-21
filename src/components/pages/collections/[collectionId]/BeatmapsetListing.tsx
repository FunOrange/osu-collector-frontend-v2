'use client';
import BeatmapsetCard from '@/components/pages/collections/[collectionId]/BeatmapsetCard';
import { groupBeatmapsets } from '@/shared/entities/v1/Beatmap';
import { Provider } from 'jotai';

export interface BeatmapsetListingProps {
  listing: ReturnType<typeof groupBeatmapsets>;
}
export default function BeatmapsetListing({ listing }: BeatmapsetListingProps) {
  return (
    <Provider>
      {listing.map(({ beatmapset, beatmaps }) => (
        <BeatmapsetCard key={beatmapset.id} beatmapset={beatmapset} beatmaps={beatmaps} />
      ))}
    </Provider>
  );
}
