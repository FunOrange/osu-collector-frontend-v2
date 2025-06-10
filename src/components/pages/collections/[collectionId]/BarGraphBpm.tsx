import BarGraph, { BarGraphProps } from '@/components/BarGraph';
import { Collection } from '@/shared/entities/v1/Collection';
import { bpmToColor } from '@/utils/theme-utils';

const bpms = [150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300] as const;

export interface BarGraphBpmProps extends Partial<BarGraphProps> {
  collection?: Collection;
}
export default function BarGraphBpm({ collection, ...props }: BarGraphBpmProps) {
  return (
    <BarGraph
      title='bpm spread'
      data={{
        x: bpms,
        y: bpms.map((bpm) => collection?.bpmSpread?.[bpm] ?? 0),
        barColors: bpms.map((bpm) => bpmToColor(bpm, true)),
      }}
      {...props}
    />
  );
}
