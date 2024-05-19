import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import breakpoints from '@/theme/breakpoints';

export default function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState<keyof typeof breakpoints>('2xl');

  const handleWindowWidthChange = () =>
    setViewportWidth(
      match(window.innerWidth)
        .when(
          (width) => width >= breakpoints['2xl'],
          () => '2xl' as const,
        )
        .when(
          (width) => width >= breakpoints.xl,
          () => 'xl' as const,
        )
        .when(
          (width) => width >= breakpoints.lg,
          () => 'lg' as const,
        )
        .when(
          (width) => width >= breakpoints.md,
          () => 'md' as const,
        )
        .otherwise(() => 'sm' as const),
    );

  useEffect(() => {
    handleWindowWidthChange();
    window.addEventListener('resize', handleWindowWidthChange);
    return () => window.removeEventListener('resize', handleWindowWidthChange);
  }, []);

  const upxxl = ['xxl'].includes(viewportWidth);
  const upxl = ['xl', 'xlg', 'xxl'].includes(viewportWidth);
  const uplg = ['lg', 'xl', 'xlg', 'xxl'].includes(viewportWidth);
  const upmd = ['md', 'lg', 'xl', 'xlg', 'xxl'].includes(viewportWidth);
  const upsm = ['sm', 'md', 'lg', 'xl', 'xlg', 'xxl'].includes(viewportWidth);
  const upxs = true;

  const downxxl = ['xs', 'sm', 'md', 'lg', 'xl', 'xlg'].includes(viewportWidth);
  const downxl = ['xs', 'sm', 'md', 'lg'].includes(viewportWidth);
  const downlg = ['xs', 'sm', 'md'].includes(viewportWidth);
  const downmd = ['xs', 'sm'].includes(viewportWidth);
  const downsm = ['xs'].includes(viewportWidth);

  return {
    viewportWidth,
    upxxl,
    upxl,
    uplg,
    upmd,
    upsm,
    upxs,
    downxl,
    downxxl,
    downlg,
    downmd,
    downsm,
  };
}
