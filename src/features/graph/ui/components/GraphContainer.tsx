import React from 'react';

interface GraphContainerProps {
  children: React.ReactNode;
}

export const GraphContainer: React.FC<GraphContainerProps> = ({ children }) => {
  return (
    <div className='bg-bg dark:bg-dark-bg relative flex h-full w-full'>
      {children}
    </div>
  );
};
