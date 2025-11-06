import React from 'react';
import cn from 'shared/lib/cn';

export const Loader: React.FC = () => {
  return (
    <div
      className={cn(
        'fixed',
        'inset-0',
        'z-[100]',
        'flex',
        'items-center',
        'justify-center',
        'backdrop-blur-sm'
      )}
    >
      <div className={cn('flex', 'space-x-2')}>
        <div
          className={cn(
            'bg-primary',
            'h-3',
            'w-3',
            'animate-bounce',
            'rounded-full'
          )}
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className={cn(
            'bg-primary',
            'h-3',
            'w-3',
            'animate-bounce',
            'rounded-full'
          )}
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className={cn(
            'bg-primary',
            'h-3',
            'w-3',
            'animate-bounce',
            'rounded-full'
          )}
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
};
