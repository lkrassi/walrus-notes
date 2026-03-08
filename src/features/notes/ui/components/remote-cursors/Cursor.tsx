import { cn } from '@/shared/lib/core';
import { memo, type FC } from 'react';

interface CursorProps {
  left: number;
  top: number;
  height: number;
  color: string;
  name: string;
}

export const Cursor: FC<CursorProps> = memo(function Cursor({
  left,
  top,
  height,
  color,
  name,
}) {
  return (
    <div
      className={cn('pointer-events-none absolute z-30')}
      style={{ left, top, height }}
    >
      <div
        className='absolute top-0 left-0 w-0.5 rounded-full'
        style={{ height, backgroundColor: color }}
      />

      <div
        className={cn(
          'absolute -top-5 left-0 rounded px-1.5 py-0.5 text-[10px] leading-none whitespace-nowrap text-white shadow-sm'
        )}
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
});
