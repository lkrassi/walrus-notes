import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { graphTheme } from '../../lib/utils';

interface NotePreviewProps {
  note: Note;
  layoutColor?: string;
  isDrag?: boolean;
  isSmall?: boolean;
  className?: string;
}

export const NotePreview = memo(function NotePreview({
  note,
  layoutColor,
  isDrag = false,
  isSmall = false,
  className,
}: NotePreviewProps) {
  const palette = graphTheme();
  const resolvedColor = layoutColor ?? palette.edge;

  const size = isSmall ? 'w-full min-w-0 max-w-none' : 'max-w-40 min-w-40';
  const padding = isSmall ? 'p-1.5 sm:p-2' : 'p-2';
  const textSize = isSmall ? 'text-[10px] leading-tight sm:text-xs' : 'text-sm';

  return (
    <div
      className={cn(
        size,
        'cursor-grab',
        'active:cursor-grabbing',
        padding,
        'text-left',
        'bg-bg',
        'text-foreground',
        'border',
        'border-border',
        'dark:border-dark-border',
        'flex items-center justify-center',
        isDrag ? 'ring-primary opacity-95 shadow-lg ring-2' : '',
        className
      )}
      style={{
        borderColor: resolvedColor,
      }}
    >
      <h3
        className={cn(
          'line-clamp-2',
          'overflow-hidden',
          'text-center',
          'font-semibold',
          'text-ellipsis',
          textSize
        )}
      >
        {note.title}
      </h3>
    </div>
  );
});
