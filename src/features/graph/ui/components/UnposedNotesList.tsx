import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { useGetUnposedNotesQuery } from 'widgets/model/stores/api';
import { DropdownContent as UniversalDropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';

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
    onNoteSelect?.(note);
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
    <div className='absolute top-4 right-4 z-10 w-64'>
      <Dropdown
        isOpen={isExpanded}
        onOpenChange={setIsExpanded}
        trigger={
          <DropdownTrigger className='border-border bg-bg dark:border-dark-border dark:bg-dark-bg dark:hover:bg-dark-primary/10 rounded-lg border p-3 transition-all'>
            <div className='flex items-center gap-2'>
              <span className='text-text dark:text-dark-text text-xs font-semibold'>
                Без позиции ({unposedNotes.length})
              </span>
              <div className='bg-primary/20 text-primary dark:bg-dark-primary/20 dark:text-dark-primary flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium'>
                {unposedNotes.length}
              </div>
            </div>
          </DropdownTrigger>
        }
        contentClassName='w-64'
      >
        <UniversalDropdownContent
          isOpen={isExpanded}
          state={contentState}
          loadingContent={
            <div className='text-text-secondary dark:text-dark-text-secondary p-3 text-xs'>
              Загрузка...
            </div>
          }
          emptyContent={null}
        >
          <div className='max-h-48 space-y-1 overflow-y-auto p-2'>
            {visibleItems.map(note => (
              <div
                key={note.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData(
                    'application/reactflow',
                    JSON.stringify(note)
                  );
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => handleNoteClick(note)}
                className='group border-border bg-bg hover:border-primary hover:bg-primary/5 dark:border-dark-border dark:bg-dark-bg dark:hover:border-dark-primary dark:hover:bg-dark-primary/5 flex cursor-pointer items-start gap-2 rounded-md border p-2 transition-all hover:shadow-sm'
              >
                <div className='min-w-0 flex-1'>
                  <h4 className='text-text group-hover:text-primary dark:text-dark-text dark:group-hover:text-dark-primary truncate text-xs font-medium'>
                    {note.title}
                  </h4>
                  <p className='text-text-secondary group-hover:text-primary/80 dark:text-dark-text-secondary dark:group-hover:text-dark-primary/80 mt-0.5 line-clamp-2 text-[10px]'>
                    {note.payload || 'Нет содержимого'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </UniversalDropdownContent>
      </Dropdown>
    </div>
  );
};
