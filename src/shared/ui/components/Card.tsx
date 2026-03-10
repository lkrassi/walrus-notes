import { cn } from '@/shared/lib/core';
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-lg border p-4',
        className
      )}
      {...props}
    />
  );
};
