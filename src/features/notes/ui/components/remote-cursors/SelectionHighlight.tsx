import { cn } from '@/shared/lib/core';
import { memo, type FC } from 'react';

interface SelectionHighlightProps {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
}

export const SelectionHighlight: FC<SelectionHighlightProps> = memo(
  function SelectionHighlight({ left, top, width, height, color }) {
    return (
      <div
        className={cn('pointer-events-none absolute z-20 rounded-[2px]')}
        style={{
          left,
          top,
          width,
          height,
          backgroundColor: color,
          opacity: 0.3,
        }}
      />
    );
  }
);
