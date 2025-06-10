import BarGraph, { BarGraphProps } from '@/components/BarGraph';
import { Collection } from '@/shared/entities/v1/Collection';
import { starToColor } from '@/utils/theme-utils';

export interface BarGraphStarsProps extends Partial<BarGraphProps> {
  collection?: Collection;
}
export default function BarGraphStars({ collection, ...props }: BarGraphStarsProps) {
  return (
    <BarGraph
      title='difficulty spread'
      data={{
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => collection?.difficultySpread?.[star] ?? 0),
        barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => starToColor(star, true)),
      }}
      {...props}
    />
  );
}
