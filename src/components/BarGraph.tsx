export interface BarGraphProps {
  title?: string;
  data: {
    x: any[];
    y: number[];
    barColors: string[];
  };
  height?: string | number;
}
export default function BarGraph({
  title,
  data,
  height = "80px",
}: BarGraphProps) {
  const length = data.x.length;
  const maxValue = Math.max(...data.y);
  return (
    <div
      className="grid w-full px-8 pt-4 pb-1 gap-x-2 bg-slate-950"
      style={{
        height,
        gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
        gridTemplateRows: "1fr auto auto",
      }}
    >
      {data.y.map((value, i) => (
        <div
          key={i}
          className="self-end"
          style={{
            backgroundColor: data.barColors[i],
            height: `${Math.round(100 * value) / maxValue}%`,
            borderBottom:
              value / maxValue < 0.02 ? "1px solid #2b2f46" : undefined,
          }}
        />
      ))}
      {data.x.map((value, i) => (
        <div key={i} className="text-xs justify-self-center text-slate-400">
          {value}
        </div>
      ))}
      {title && (
        <div className="text-sm col-span-full text-slate-600 justify-self-center">
          {title}
        </div>
      )}
    </div>
  );
}
