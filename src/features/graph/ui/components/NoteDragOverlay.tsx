import { cn } from '@/shared/lib';
import type { Note } from '@/shared/model';
import { memo } from 'react';

interface NoteDragOverlayProps {
  note: Note | null;
}

export const NoteDragOverlay = memo(function NoteDragOverlay({
  note,
}: NoteDragOverlayProps) {
  if (!note) return null;

  return (
    <div
      className={cn(
        'dark:bg-dark-bg',
        'border-primary',
        'dark:border-primary-dark',
        'max-w-xs',
        'rounded-lg',
        'border',
        'bg-white',
        'p-3',
        'shadow-lg'
      )}
    >
      <h4
        className={cn(
          'text-text',
          'dark:text-dark-text',
          'truncate',
          'text-sm',
          'font-medium'
        )}
      >
        {note.title}
      </h4>
    </div>
  );
});
