import { cn } from '@/shared/lib/core';
import { FileText } from 'lucide-react';
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
    <div className={cn('min-w-0', 'flex', 'items-center', 'flex-1')}>
      <div className={cn('flex', 'items-center', 'gap-2.5', 'min-w-0')}>
        <div
          className={cn(
            'inline-flex',
            'h-6',
            'w-6',
            'items-center',
            'justify-center',
            'rounded-md',
            'bg-primary/12',
            'text-primary',
            'shrink-0'
          )}
        >
          <FileText className='h-4 w-4' />
        </div>

        <button
          onClick={onEdit}
          disabled={!canWrite}
          className={cn(
            'text-text',
            'dark:text-dark-text',
            'truncate',
            'text-base',
            'font-semibold',
            'leading-tight',
            'flex',
            'items-center',
            'gap-2',
            'text-left',
            'transition-colors',
            'hover:text-primary',
            'dark:hover:text-dark-primary',
            canWrite ? 'cursor-pointer' : 'cursor-default',
            'bg-transparent',
            'border-none',
            'padding-0',
            'min-w-0',
            'max-w-full'
          )}
          title={title}
        >
          {title}
        </button>
      </div>
    </div>
  );
});
