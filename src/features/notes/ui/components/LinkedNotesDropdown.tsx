import { memo, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { DropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';
import { LinkedNoteItem } from './LinkedNoteItem';

interface LinkedNotesDropdownProps {
  label: string;
  notes: Note[];
  layoutId?: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNoteClick: (note: Note) => void;
  emptyMessage: string;
}

export const LinkedNotesDropdown: FC<LinkedNotesDropdownProps> = memo(
  function LinkedNotesDropdown({
    label,
    notes,
    layoutId,
    isLoading,
    isOpen,
    onOpenChange,
    onNoteClick,
    emptyMessage,
  }) {
    const { visibleItems } = useDropdown({
      items: notes,
      isOpen,
      enablePagination: false,
    });

    const getContentState = () => {
      if (isLoading) return 'loading';
      if (visibleItems.length === 0) return 'empty';
      return 'content';
    };

    return (
      <div className={cn('flex-1', 'min-w-0')}>
        <Dropdown
          position={'auto'}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          trigger={
            <DropdownTrigger
              isOpen={isOpen}
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
                  {label}
                </span>
              </div>
            </DropdownTrigger>
          }
          contentClassName={cn('max-h-60 w-full overflow-y-auto')}
        >
          <DropdownContent
            isOpen={isOpen}
            state={getContentState()}
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
                {emptyMessage}
              </div>
            }
            className={cn(
              'dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg',
              'w-full'
            )}
          >
            {visibleItems.map(note => (
              <LinkedNoteItem
                key={note.id}
                note={note}
                layoutId={layoutId}
                onClick={onNoteClick}
              />
            ))}
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
);
