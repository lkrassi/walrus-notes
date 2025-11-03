import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { useGetUnposedNotesQuery } from 'widgets/model/stores/api';
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
          <DropdownTrigger
            isOpen={isExpanded}
            className='border-border rounded-lg border p-3 transition-all'
          >
            <div className='flex items-center gap-2'>
              <span className='text-text dark:text-dark-text text-xs font-semibold'>
                Без позиции ({unposedNotes.length})
              </span>
            </div>
          </DropdownTrigger>
        }
        contentClassName='w-64 max-h-60 overflow-y-auto'
      >
        <DropdownContent
          isOpen={isExpanded}
          state={contentState}
          emptyContent={null}
          className='dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg'
        >
          {visibleItems.map(note => (
            <button
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
              className='dark:bg-dark-bg hover:bg-primary/30 dark:hover:bg-primary-dark flex w-full items-center gap-3 rounded-md px-4 py-3 transition duration-200'
            >
              <div className='min-w-0 flex-1 text-left'>
                <h4 className='text-text dark:text-dark-text truncate text-sm font-medium'>
                  {note.title}
                </h4>
              </div>
            </button>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
};
