"use client";
import BeatmapsetCard from "@/components/pages/collections/[collectionId]/BeatmapsetCard";
import { Provider } from "jotai";

export interface BeatmapsetListingProps {
  listing: any;
}
export default function BeatmapsetListing({ listing }: BeatmapsetListingProps) {
  return (
    <Provider>
      {listing.map(({ beatmapset, beatmaps }, index) => (
        <BeatmapsetCard key={index} beatmapset={beatmapset} beatmaps={beatmaps} />
      ))}
    </Provider>
  );
}
