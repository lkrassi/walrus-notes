import { cn } from '@/shared/lib/core';
import { memo, type FC, type MouseEvent } from 'react';

interface NoteTitleProps {
  title: string;
  onEdit: (event: MouseEvent<HTMLElement>) => void;
  canWrite?: boolean;
}

export const NoteTitle: FC<NoteTitleProps> = memo(function NoteTitle({
  title,
  onEdit,
  canWrite = true,
}) {
  return (
    <div className={cn('min-w-0', 'flex-1')}>
      <div
        className={cn(
          'flex',
          'items-center',
          'justify-between',
          'gap-3',
          'flex-wrap'
        )}
      >
        <button
          onClick={onEdit}
          disabled={!canWrite}
          className={cn(
            'note-title',
            'flex',
            'items-center',
            'gap-2',
            'text-left',
            'hover:opacity-75',
            'transition-opacity',
            canWrite ? 'cursor-pointer' : 'cursor-default',
            'bg-transparent',
            'border-none',
            'padding-0',
            'min-w-0'
          )}
        >
          {title}
        </button>
      </div>
    </div>
  );
});
