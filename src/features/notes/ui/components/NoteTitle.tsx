import { memo, type FC, type MouseEvent } from 'react';
import { cn } from 'shared/lib/cn';

interface NoteTitleProps {
  title: string;
  onEdit: (event: MouseEvent<HTMLElement>) => void;
}

export const NoteTitle: FC<NoteTitleProps> = memo(function NoteTitle({
  title,
  onEdit,
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
          className={cn(
            'note-title',
            'flex',
            'items-center',
            'gap-2',
            'text-left',
            'hover:opacity-75',
            'transition-opacity',
            'cursor-pointer',
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
