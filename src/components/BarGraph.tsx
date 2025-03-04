import { cn } from '@/utils/shadcn-utils';
import Link from 'next/link';

export interface BarGraphProps {
  title?: string;
  data: {
    x: readonly any[];
    y: readonly number[];
    barColors: readonly string[];
  };
  barHref?: (x: any) => string;
  className?: string;
  barClassName?: string;
}
export default function BarGraph({ title, data, barHref, className, barClassName }: BarGraphProps) {
  const length = data.x.length;
  const maxValue = Math.max(...data.y);
  const barStyle = (y, i) => ({
    backgroundColor: data.barColors[i],
    height: `${Math.round(100 * y) / maxValue}%`,
    borderBottom: y / maxValue < 0.02 ? '1px solid #2b2f46' : undefined,
  });
  return (
    <div
      className={cn('grid w-full px-8 pt-4 pb-1 gap-x-2 bg-slate-950', className)}
      style={{
        gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr auto auto',
      }}
    >
      {data.y.map((y, i) =>
        false && barHref ? (
          <Link
            key={i}
            href={barHref(data.x[i])}
            className={cn('self-end cursor-pointer hover:border hover:border-gray-50', barClassName)}
            style={barStyle(y, i)}
            replace
          />
        ) : (
          <div key={i} className={cn('self-end', barClassName)} style={barStyle(y, i)} />
        ),
      )}
      {data.x.map((value, i) => (
        <div
          key={i}
          className={cn(
            'text-xs justify-self-center text-slate-400',
            data.x.length >= 16 && i % 3 !== 0 && 'invisible lg:visible',
          )}
        >
          {value}
        </div>
      ))}
      {title && <div className='text-sm col-span-full text-slate-500 justify-self-center'>{title}</div>}
    </div>
  );
}
