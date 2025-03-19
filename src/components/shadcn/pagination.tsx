import * as React from 'react';
import { ArrowLeftToLine, ArrowRightToLine, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/utils/shadcn-utils';
import { Button, ButtonProps, buttonVariants } from '@/components/shadcn/button';

export interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
}

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role='navigation'
    aria-label='pagination'
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationButtonProps = ButtonProps & {
  isActive?: boolean;
};
const PaginationButton = ({ className, isActive, size = 'icon', ...props }: PaginationButtonProps) => (
  <Button variant={isActive ? 'outline' : 'ghost'} disabled={!isActive} {...props} />
);
PaginationButton.displayName = 'PaginationButton';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label='Go to previous page'
    isActive
    variant='ghost'
    size='default'
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className='h-4 w-4' />
    <span>Prev</span>
  </PaginationButton>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label='Go to next page'
    isActive
    variant='ghost'
    size='default'
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className='h-4 w-4' />
  </PaginationButton>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationFirst = ({ ...props }: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton aria-label='Go to first page' isActive variant='ghost' size='default' {...props}>
    <ArrowLeftToLine className='h-4 pr-2' />
    <span>First</span>
  </PaginationButton>
);
PaginationFirst.displayName = 'PaginationFirst';

const PaginationLast = ({ ...props }: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton aria-label='Go to last page' isActive variant='ghost' size='default' {...props}>
    <span>Last</span>
    <ArrowRightToLine className='h-4 pl-2' />
  </PaginationButton>
);
PaginationLast.displayName = 'PaginationLast';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className='h-4 w-4' />
    <span className='sr-only'>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
};
