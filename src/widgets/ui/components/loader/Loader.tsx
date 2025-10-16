import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm'>
      <div className='flex space-x-2'>
        <div
          className='bg-primary h-3 w-3 animate-bounce rounded-full'
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className='bg-primary h-3 w-3 animate-bounce rounded-full'
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className='bg-primary h-3 w-3 animate-bounce rounded-full'
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
};
