import { cn } from '@/utils/shadcn-utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
}
function Skeleton({ className, loading, children, ...props }: SkeletonProps) {
  return (
    <div className={cn('transition-all', loading ? 'animate-pulse rounded-md bg-muted' : '', className)} {...props}>
      <div className={cn('transition-all', loading ? 'pointer-events-none opacity-0' : '')}>{children}</div>
    </div>
  );
}

export { Skeleton };
