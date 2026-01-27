import type { RootState } from 'app/store';
import { notesApi, useGetNotesQuery } from 'app/store/api';
import { useState } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useAppSelector } from 'widgets/hooks/redux';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { DropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';

interface LinkedNotesListProps {
  layoutId?: string | null;
  linkedInIds?: string[];
  linkedOutIds?: string[];
  onNoteSelect?: (note: Note) => void;
}

export const LinkedNotesList = ({
  layoutId,
  linkedInIds = [],
  linkedOutIds = [],
  onNoteSelect,
}: LinkedNotesListProps) => {
  const { t } = useLocalization();
  const shouldSkip =
    !layoutId ||
    ((!linkedInIds || linkedInIds.length === 0) &&
      (!linkedOutIds || linkedOutIds.length === 0));

  const { data: notesResponse, isLoading } = useGetNotesQuery(
    { layoutId: layoutId || '', page: 1 },
    { skip: shouldSkip }
  );

  const [isExpandedIn, setIsExpandedIn] = useState(false);
  const [isExpandedOut, setIsExpandedOut] = useState(false);

  const cachedNotes = useAppSelector(
    state =>
      notesApi.endpoints.getNotes.select({ layoutId: layoutId || '', page: 1 })(
        state as RootState
      )?.data?.data
  );

  const allNotes = notesResponse?.data || cachedNotes || [];

  const linkedNotesIn = allNotes.filter(n => linkedInIds.includes(n.id));
  const linkedNotesOut = allNotes.filter(n => linkedOutIds.includes(n.id));

  const { visibleItems: visibleIn } = useDropdown({
    items: linkedNotesIn,
    isOpen: isExpandedIn,
    enablePagination: false,
  });

  const { visibleItems: visibleOut } = useDropdown({
    items: linkedNotesOut,
    isOpen: isExpandedOut,
    enablePagination: false,
  });

  const handleNoteClick = (note: Note) => {
    const noteWithLayout = { ...note, layoutId } as Note;
    onNoteSelect?.(noteWithLayout);
    setIsExpandedIn(false);
    setIsExpandedOut(false);
  };

  const getContentState = (items: Note[]) => {
    if (isLoading) return 'loading';
    if (items.length === 0) return 'empty';
    return 'content';
  };

  const contentStateIn = getContentState(visibleIn);
  const contentStateOut = getContentState(visibleOut);

  if (!layoutId) return null;

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'gap-2',
        'w-full',
        'max-w-full',
        'items-start'
      )}
    >
      <div className={cn('flex-1', 'min-w-0')}>
        <Dropdown
          position={'auto'}
          isOpen={isExpandedOut}
          onOpenChange={setIsExpandedOut}
          trigger={
            <DropdownTrigger
              isOpen={isExpandedOut}
              className={cn(
                'w-full',
                'min-w-0',
                'rounded-lg',
                'border',
                'border-border',
                'dark:border-dark-border',
                'bg-white',
                'dark:bg-dark-bg',
                'p-2',
                'transition-all'
              )}
            >
              <div className={cn('flex items-center gap-2')}>
                <span
                  className={cn(
                    'text-text dark:text-dark-text text-xs font-semibold'
                  )}
                >
                  {t('common:links.outgoing', {
                    count: linkedNotesOut.length,
                  })}
                </span>
              </div>
            </DropdownTrigger>
          }
          contentClassName={cn('max-h-60 w-full overflow-y-auto')}
        >
          <DropdownContent
            isOpen={isExpandedOut}
            state={contentStateOut}
            emptyContent={
              <div
                className={cn(
                  'px-4',
                  'py-2',
                  'text-center',
                  'text-xs',
                  'text-text/60',
                  'dark:text-dark-text/60'
                )}
              >
                {t('common:links.noConnections')}
              </div>
            }
            className={cn(
              'dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg',
              'w-full'
            )}
          >
            {visibleOut.map(note => (
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
            ))}
          </DropdownContent>
        </Dropdown>
      </div>

      <div className={cn('flex-1', 'min-w-0')}>
        <Dropdown
          position={'auto'}
          isOpen={isExpandedIn}
          onOpenChange={setIsExpandedIn}
          trigger={
            <DropdownTrigger
              isOpen={isExpandedIn}
              className={cn(
                'w-full',
                'min-w-0',
                'rounded-lg',
                'border',
                'border-border',
                'dark:border-dark-border',
                'bg-white',
                'dark:bg-dark-bg',
                'p-2',
                'transition-all'
              )}
            >
              <div className={cn('flex items-center gap-2')}>
                <span
                  className={cn(
                    'text-text dark:text-dark-text text-xs font-semibold'
                  )}
                >
                  {t('common:links.incoming', {
                    count: linkedNotesIn.length,
                  })}
                </span>
              </div>
            </DropdownTrigger>
          }
          contentClassName={cn('max-h-60 w-full overflow-y-auto')}
        >
          <DropdownContent
            isOpen={isExpandedIn}
            state={contentStateIn}
            emptyContent={
              <div
                className={cn(
                  'px-4',
                  'py-2',
                  'text-center',
                  'text-xs',
                  'text-text/60',
                  'dark:text-dark-text/60'
                )}
              >
                {t('common:links.noConnections')}
              </div>
            }
            className={cn(
              'dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg',
              'w-full'
            )}
          >
            {visibleIn.map(note => (
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
            ))}
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
};
