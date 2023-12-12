import Link from "next/link";

export interface BarGraphProps {
  title?: string;
  data: {
    x: readonly any[];
    y: readonly number[];
    barColors: readonly string[];
  };
  height?: string | number;
  barHref?: (x: any) => string;
}
export default function BarGraph({ title, data, barHref, height = "80px" }: BarGraphProps) {
  const length = data.x.length;
  const maxValue = Math.max(...data.y);
  const barStyle = (y, i) => ({
    backgroundColor: data.barColors[i],
    height: `${Math.round(100 * y) / maxValue}%`,
    borderBottom: y / maxValue < 0.02 ? "1px solid #2b2f46" : undefined,
  });
  return (
    <div
      className="grid w-full px-8 pt-4 pb-1 gap-x-2 bg-slate-950"
      style={{
        height,
        gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
        gridTemplateRows: "1fr auto auto",
      }}
    >
      {data.y.map((y, i) =>
        barHref ? (
          <Link
            key={i}
            href={barHref(data.x[i])}
            className="self-end cursor-pointer hover:border hover:border-gray-50"
            style={barStyle(y, i)}
            replace
          />
        ) : (
          <div key={i} className="self-end" style={barStyle(y, i)} />
        )
      )}
      {data.x.map((value, i) => (
        <div key={i} className="text-xs justify-self-center text-slate-400">
          {value}
        </div>
      ))}
      {title && (
        <div className="text-sm col-span-full text-slate-500 justify-self-center">{title}</div>
      )}
    </div>
  );
}
