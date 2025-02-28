import BarGraph, { BarGraphProps } from '@/components/BarGraph';
import { Collection } from '@/shared/entities/v1/Collection';
import { starToColor } from '@/utils/theme-utils';
import { match } from 'ts-pattern';

export interface BarGraphStarsProps extends Partial<BarGraphProps> {
  collection: Collection;
  replaceQueryParams: (newParams: any) => string;
}
export default function BarGraphStars({ collection, replaceQueryParams, ...props }: BarGraphStarsProps) {
  return (
    <BarGraph
      title='difficulty spread'
      data={{
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => collection.difficultySpread?.[star] ?? 0),
        barColors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => starToColor(star, true)),
      }}
      barHref={(stars: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => {
        return replaceQueryParams({
          sortBy: 'difficulty_rating',
          orderBy: 'asc',
          cursor: undefined,
          ...match(stars)
            .with(1, () => ({ filterMax: 2 }))
            .with(2, 3, 4, 5, 6, 7, 8, 9, (stars) => ({ filterMin: stars, filterMax: stars + 1 }))
            .with(10, () => ({ filterMin: 10 }))
            .exhaustive(),
        });
      }}
      {...props}
    />
  );
}
