import { cn } from '@/shared/lib/core';
import type { ReactNode } from 'react';

interface RenderWithStateProps {
  isInitialLoading: boolean;
  isRefreshing?: boolean;
  skeleton: ReactNode;
  overlay?: ReactNode;
  blockingOverlay?: boolean;
  children: ReactNode;
  className?: string;
}

export const RenderWithState = ({
  isInitialLoading,
  isRefreshing = false,
  skeleton,
  overlay,
  blockingOverlay = false,
  children,
  className,
}: RenderWithStateProps) => {
  const showOverlay = isRefreshing && !isInitialLoading;

  return (
    <div className={cn('relative h-full w-full', className)}>
      {isInitialLoading ? (
        <div className='h-full w-full'>{skeleton}</div>
      ) : (
        <div className='h-full w-full'>{children}</div>
      )}
      {showOverlay && overlay ? (
        <div
          className={cn(
            'absolute inset-0',
            blockingOverlay ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          {overlay}
        </div>
      ) : null}
    </div>
  );
};

RenderWithState.displayName = 'RenderWithState';
