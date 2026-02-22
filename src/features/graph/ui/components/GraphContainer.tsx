import { type FC, type ReactNode } from 'react';
import { cn } from 'shared/lib/cn';

interface GraphContainerProps {
  children: ReactNode;
}

export const GraphContainer: FC<GraphContainerProps> = ({ children }) => {
  return (
    <div
      className={cn(
        'bg-bg',
        'dark:bg-dark-bg',
        'relative',
        'flex',
        'h-full',
        'w-full'
      )}
    >
      {children}
    </div>
  );
};
