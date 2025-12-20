import { useGetNotesQuery, notesApi } from 'app/store/api';
import { useState } from 'react';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { DropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';
import { useAppSelector } from 'widgets/hooks/redux';
import type { RootState } from 'app/store';

interface LinkedNotesListProps {
  layoutId?: string | null;
  linkedIds: string[];
  onNoteSelect?: (note: Note) => void;
}

export const LinkedNotesList = ({
  layoutId,
  linkedIds,
  onNoteSelect,
}: LinkedNotesListProps) => {
  const shouldSkip = !layoutId || !linkedIds || linkedIds.length === 0;

  const { data: notesResponse, isLoading } = useGetNotesQuery(
    { layoutId: layoutId || '', page: 1 },
    { skip: shouldSkip }
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const cachedNotes = useAppSelector(
    state =>
      notesApi.endpoints.getNotes.select({ layoutId: layoutId || '', page: 1 })(
        state as RootState
      )?.data?.data
  );

  const allNotes = notesResponse?.data || cachedNotes || [];

  const linkedNotes = allNotes.filter(n => linkedIds.includes(n.id));

  const { visibleItems } = useDropdown({
    items: linkedNotes,
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

  if (contentState === 'empty') return null;

  return (
    <div className={cn('relative', 'w-full')}>
      <Dropdown
        position={'auto'}
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
                Связанные ({linkedNotes.length})
              </span>
            </div>
          </DropdownTrigger>
        }
        contentClassName={cn('max-h-60 w-56 overflow-y-auto')}
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
            <button
              key={note.id}
              draggable
              onDragStart={e => {
                const noteWithLayout = { ...note, layoutId } as Note;
                e.dataTransfer.setData(
                  'application/reactflow',
                  JSON.stringify(noteWithLayout)
                );
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => handleNoteClick(note)}
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

                'transition',
                'duration-200'
              )}
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
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default LinkedNotesList;
