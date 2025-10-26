import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from 'shared/ui/components/Dropdown';
import { useGetUnposedNotesQuery } from 'widgets/model/stores/api';

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

  const handleNoteClick = (note: Note) => {
    onNoteSelect?.(note);
  };

  if (isLoading) {
    return (
      <div className='absolute top-4 right-4 z-10 w-64 rounded-lg border border-border bg-bg/95 backdrop-blur-sm dark:border-dark-border dark:bg-dark-bg/95'>
        <div className='p-3 text-xs text-text-secondary dark:text-dark-text-secondary'>
          Загрузка...
        </div>
      </div>
    );
  }

  if (unposedNotes.length === 0) {
    return null;
  }

  return (
    <div className='absolute top-4 right-4 z-10 w-64'>
      <Dropdown
        isOpen={isExpanded}
        onOpenChange={setIsExpanded}
        trigger={
          <DropdownTrigger className='rounded-lg border border-border bg-bg p-3 transition-all  dark:border-dark-border dark:bg-dark-bg dark:hover:bg-dark-primary/10'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-semibold text-text dark:text-dark-text'>
                Без позиции ({unposedNotes.length})
              </span>
              <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary dark:bg-dark-primary/20 dark:text-dark-primary'>
                {unposedNotes.length}
              </div>
            </div>
          </DropdownTrigger>
        }
        contentClassName='w-64'
      >
        <DropdownContent maxHeight='max-h-48'>
          <div className='space-y-1 p-2'>
            {unposedNotes.map(note => (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify(note));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => handleNoteClick(note)}
                className='group flex cursor-pointer items-start gap-2 rounded-md border border-border bg-bg p-2 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm dark:border-dark-border dark:bg-dark-bg dark:hover:border-dark-primary dark:hover:bg-dark-primary/5'
              >
                <div className='min-w-0 flex-1'>
                  <h4 className='truncate text-xs font-medium text-text group-hover:text-primary dark:text-dark-text dark:group-hover:text-dark-primary'>
                    {note.title}
                  </h4>
                  <p className='mt-0.5 line-clamp-2 text-[10px] text-text-secondary group-hover:text-primary/80 dark:text-dark-text-secondary dark:group-hover:text-dark-primary/80'>
                    {note.payload || 'Нет содержимого'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};
