import BarGraph, { BarGraphProps } from "@/components/BarGraph";
import { Collection } from "@/entities/Collection";
import { bpmToColor } from "@/utils/theme-utils";
import { match } from "ts-pattern";

const bpms = [
  150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
] as const;

export interface BarGraphBpmProps extends Partial<BarGraphProps> {
  collection: Collection;
  replaceQueryParams: (newParams: any) => string;
}
export default function BarGraphBpm({
  collection,
  replaceQueryParams,
  ...props
}: BarGraphBpmProps) {
  return (
    <BarGraph
      title="bpm spread"
      data={{
        x: bpms,
        y: bpms.map((bpm) => collection.bpmSpread?.[bpm] ?? 0),
        barColors: bpms.map((bpm) => bpmToColor(bpm, true)),
      }}
      barHref={(bpm: (typeof bpms)[number]) =>
        replaceQueryParams({
          sortBy: "bpm",
          orderBy: "asc",
          cursor: undefined,
          ...match(bpm)
            .with(150, () => ({ filterMin: 0, filterMax: 160 }))
            .with(300, () => ({ filterMin: 300, filterMax: null }))
            .otherwise((bpm) => ({ filterMin: bpm, filterMax: bpm + 10 })),
        })
      }
      {...props}
    />
  );
}
