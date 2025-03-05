'use client';
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/shadcn-utils';
import { match } from 'ts-pattern';

type Variant = 'sky' | 'orange' | 'white';
const bg = (variant: Variant) =>
  match(variant)
    .with('sky', () => ({ fill: 'bg-sky-500', border: 'border-sky-500', track: 'bg-sky-500/30' }))
    .with('orange', () => ({ fill: 'bg-orange-500', border: 'border-orange-500', track: 'bg-orange-500/30' }))
    .with('white', () => ({ fill: 'bg-slate-300', border: 'border-slate-300', track: 'bg-slate-300/30' }))
    .exhaustive();

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { variant?: Variant }
>(({ className, variant = 'white', ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn('relative h-1 w-full grow overflow-hidden rounded-full', bg(variant).track)}>
      <SliderPrimitive.Range className={cn('absolute h-full', bg(variant).fill)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-4 w-4 rounded-full border ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        bg(variant).border,
        bg(variant).fill,
      )}
    />
    <SliderPrimitive.Thumb
      className={cn(
        'block h-4 w-4 rounded-full border ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        bg(variant).border,
        bg(variant).fill,
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
