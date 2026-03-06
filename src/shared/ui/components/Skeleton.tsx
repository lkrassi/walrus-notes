import { type FC } from 'react';
import { cn } from 'shared/lib/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-md',
        'bg-border dark:bg-dark-border',
        className
      )}
    />
  );
};
