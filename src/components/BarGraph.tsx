'use client';
import { calculateOverlap } from '@/utils/number-utils';
import { cn } from '@/utils/shadcn-utils';

export interface BarGraphProps {
  title?: string;
  data: {
    x: readonly any[];
    y: readonly number[];
    barColors: readonly string[];
  };
  onBarClick?: (x: any) => any;
  className?: string;
  barClassName?: string;
  filter?: [number, number];
}
export default function BarGraph({ title, data, onBarClick, className, barClassName, filter }: BarGraphProps) {
  const length = data.x.length;
  const maxValue = Math.max(...data.y);
  const barStyle = (x: number, y: number, i: number) => ({
    opacity: 0.3 + 0.7 * calculateOverlap([x, x + 1], filter),
    backgroundColor: data.barColors[i],
    height: `${Math.round(100 * y) / maxValue}%`,
    borderBottom: y / maxValue < 0.02 ? '1px solid #2b2f46' : undefined,
  });
  return (
    <div
      className={cn('grid w-full px-8 pt-4 pb-1 bg-slate-950', className)}
      style={{
        gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr auto auto',
      }}
    >
      {data.y.map((y, i) => (
        <div
          key={i}
          className={cn('flex h-full group px-1', onBarClick && 'cursor-pointer')}
          onClick={() => onBarClick?.(data.x[i])}
        >
          <div
            className={cn(
              'w-full transition-all self-end',
              onBarClick && 'cursor-pointer group-hover:brightness-125 group-hover:scale-105',
              barClassName,
            )}
            style={barStyle(data.x[i], y, i)}
          />
        </div>
      ))}
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
