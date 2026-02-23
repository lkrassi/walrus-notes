import { memo, type DragEvent, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';

interface LinkedNoteItemProps {
  note: Note;
  layoutId?: string | null;
  onClick: (note: Note) => void;
}

export const LinkedNoteItem: FC<LinkedNoteItemProps> = memo(
  function LinkedNoteItem({ note, layoutId, onClick }) {
    const handleDragStart = (e: DragEvent<HTMLButtonElement>) => {
      const noteWithLayout = { ...note, layoutId } as Note;
      e.dataTransfer.setData(
        'application/reactflow',
        JSON.stringify(noteWithLayout)
      );
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
      onClick(note);
    };

    return (
      <button
        key={note.id}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        className={cn(
          'dark:bg-dark-bg',
          'hover:bg-primary/30',
          'dark:hover:bg-primary-dark',
          'flex',
          'w-full',
          'items-center',
          'gap-3',
          'rounded-md',
          'px-4',
          'py-2',
          'transition',
          'duration-200'
        )}
      >
        <div className={cn('min-w-0 flex-1 text-left')}>
          <p className={cn('text-text dark:text-dark-text truncate')}>
            {note.title}
          </p>
        </div>
      </button>
    );
  }
);
