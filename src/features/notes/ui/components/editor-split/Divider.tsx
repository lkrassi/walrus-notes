import { memo, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import type { DividerProps } from './types';

export const Divider: FC<DividerProps> = memo(function Divider({
  isDesktop,
  onPointerDown,
}) {
  return (
    <div
      role='separator'
      aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
      onPointerDown={onPointerDown}
      className={cn(
        isDesktop
          ? 'h-full w-2 cursor-col-resize'
          : 'h-2 w-full cursor-row-resize',
        'select-none',
        'touch-none',
        'bg-transparent',
        'hover:bg-border',
        'dark:hover:bg-dark-border'
      )}
    />
  );
});
