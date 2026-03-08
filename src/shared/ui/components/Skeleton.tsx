import { cn } from '@/shared/lib/core';
import { type FC } from 'react';

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
