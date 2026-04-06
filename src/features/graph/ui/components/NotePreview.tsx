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

  const size = isSmall ? 'w-full min-w-0 max-w-none' : 'max-w-52 min-w-48';
  const padding = isSmall ? 'p-2 sm:p-2.5' : 'p-2.5';
  const textSize = isSmall
    ? 'text-[10px] leading-tight sm:text-xs'
    : 'text-[13px] leading-5';

  return (
    <div
      className={cn(
        size,
        'cursor-grab',
        'active:cursor-grabbing',
        padding,
        'text-left',
        'bg-bg/95 dark:bg-dark-bg/90',
        'text-foreground dark:text-dark-text',
        'border',
        'border-border/70 dark:border-dark-border/80',
        'relative overflow-hidden',
        'flex flex-col justify-center gap-1',
        isDrag ? 'ring-primary/65 opacity-95 ring-2' : '',
        className
      )}
      style={{ borderColor: resolvedColor }}
    >
      <div
        className='absolute inset-y-0 left-0 w-1.5 opacity-90'
        style={{ background: resolvedColor }}
        aria-hidden
      />

      <h3
        className={cn(
          'line-clamp-2',
          'overflow-hidden',
          'text-left',
          'font-semibold tracking-[0.01em]',
          'text-ellipsis',
          'pl-2',
          textSize
        )}
      >
        {note.title}
      </h3>
    </div>
  );
});
