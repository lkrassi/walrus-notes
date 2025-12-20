import React from 'react';
import cn from 'shared/lib/cn';

interface GraphContainerProps {
  children: React.ReactNode;
}

export const GraphContainer: React.FC<GraphContainerProps> = ({ children }) => {
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
