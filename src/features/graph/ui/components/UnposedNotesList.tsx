import { useDraggable } from '@dnd-kit/core';
import { useGetUnposedNotesQuery } from 'app/store/api';
import { useState } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { DropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';

interface UnposedNotesListProps {
  layoutId: string;
  onNoteSelect?: (note: Note) => void;
}

export const UnposedNotesList = ({
  layoutId,
  onNoteSelect,
}: UnposedNotesListProps) => {
  const { data: unposedNotesResponse, isLoading } = useGetUnposedNotesQuery({
    layoutId,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const unposedNotes = unposedNotesResponse?.data || [];

  const { visibleItems } = useDropdown({
    items: unposedNotes,
    isOpen: isExpanded,
    enablePagination: false,
  });

  const handleNoteClick = (note: Note) => {
    const noteWithLayout = { ...note, layoutId } as Note;
    onNoteSelect?.(noteWithLayout);
    setIsExpanded(false);
  };

  const getContentState = () => {
    if (isLoading) return 'loading';
    if (visibleItems.length === 0) return 'empty';
    return 'content';
  };

  const contentState = getContentState();

  if (contentState === 'empty') {
    return null;
  }

  return (
    <div className={cn('absolute', 'top-4', 'right-4', 'z-10', 'w-64')}>
      <Dropdown
        isOpen={isExpanded}
        onOpenChange={setIsExpanded}
        trigger={
          <DropdownTrigger
            isOpen={isExpanded}
            className={cn(
              'rounded-lg',
              'border',
              'border-border',
              'dark:border-dark-border',
              'bg-white',
              'dark:bg-dark-bg',
              'p-3',
              'transition-all'
            )}
          >
            <div className={cn('flex items-center gap-2')}>
              <span
                className={cn(
                  'text-text dark:text-dark-text text-xs font-semibold'
                )}
              >
                Без позиции ({unposedNotes.length})
              </span>
            </div>
          </DropdownTrigger>
        }
        contentClassName={cn('max-h-60 w-64 overflow-y-auto')}
      >
        <DropdownContent
          isOpen={isExpanded}
          state={contentState}
          emptyContent={null}
          className={cn(
            'dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg'
          )}
        >
          {visibleItems.map(note => (
            <DraggableNoteItem
              key={note.id}
              note={note}
              onClick={handleNoteClick}
            />
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

const DraggableNoteItem = ({
  note,
  onClick,
}: {
  note: Note;
  onClick: (note: Note) => void;
  isDragging?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: isItemDragging,
  } = useDraggable({
    id: `unposed-${note.id}`,
    data: note,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick(note)}
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
        'py-3',
        'transition',
        'duration-200',
        'cursor-grab',
        'active:cursor-grabbing',
        isItemDragging ? 'opacity-50' : ''
      )}
      title={`Перетаскиваемая заметка: ${note.title}`}
    >
      <div className={cn('min-w-0 flex-1 text-left')}>
        <h4
          className={cn(
            'text-text dark:text-dark-text truncate text-sm font-medium'
          )}
        >
          {note.title}
        </h4>
      </div>
    </button>
  );
};
