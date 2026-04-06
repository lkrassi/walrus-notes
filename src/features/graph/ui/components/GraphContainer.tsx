import { cn } from '@/shared/lib/core';
import { type FC, type ReactNode } from 'react';

interface GraphContainerProps {
  children: ReactNode;
}

export const GraphContainer: FC<GraphContainerProps> = ({ children }) => {
  return (
    <div
      className={cn(
        'bg-bg dark:bg-dark-bg',
        'relative',
        'flex',
        'h-full',
        'w-full',
        'overflow-hidden'
      )}
    >
      {children}
    </div>
  );
};
