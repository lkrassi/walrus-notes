import React, { useState } from 'react';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useGetNotesQuery } from 'app/store/api/notesApi';
import { useAppDispatch } from 'widgets/hooks/redux';
import { openTab, switchTab } from 'app/store/slices/tabsSlice';
import { createTabId } from 'widgets/model/utils/tabUtils';
import { Link as LinkIcon } from 'lucide-react';
import { Dropdown, DropdownTrigger } from 'shared/ui/components/Dropdown';
import { useDropdown } from 'widgets/hooks/useDropdown';
import { DropdownContent } from 'widgets/ui/components/dropdown/DropdownContent';

interface RelatedNotesDropdownProps {
  note?: Note;
  layoutId?: string;
}

export const RelatedNotesDropdown: React.FC<RelatedNotesDropdownProps> = ({
  note,
  layoutId,
}) => {
  const dispatch = useAppDispatch();

  const layoutIdToUse = layoutId || note?.layoutId || '';

  const { data: notesResponse, isLoading } = useGetNotesQuery(
    { layoutId: layoutIdToUse, page: 1 },
    { skip: !layoutIdToUse }
  );

  const linkedNotes: Note[] =
    note && note.linkedWith
      ? (notesResponse?.data || []).filter(n =>
          (note.linkedWith || []).includes(n.id)
        )
      : [];

  const [isExpanded, setIsExpanded] = useState(false);

  const { visibleItems } = useDropdown({
    items: linkedNotes,
    isOpen: isExpanded,
    enablePagination: false,
  });

  const getContentState = () => {
    if (isLoading) return 'loading' as const;
    if (!visibleItems || visibleItems.length === 0) return 'empty' as const;
    return 'content' as const;
  };

  const contentState = getContentState();

  const handleOpenLinkedNote = (ln: Note) => {
    const item = {
      id: ln.id,
      type: 'note' as const,
      title: ln.title,
      parentId: ln.layoutId,
      note: ln,
    } as any;

    dispatch(openTab(item));
    dispatch(switchTab(createTabId('note', ln.id)));
    setIsExpanded(false);
  };

  if (contentState === 'empty') return null;

  return (
    <div
      className={cn(
        'absolute',
        'top-3',
        'right-3',
        'z-40',
        'w-56',
        'max-sm:left-1/2',
        'max-sm:right-auto',
        'max-sm:-translate-x-1/2',
      )}
    >
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
              'p-2',
              'w-full'
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
        contentClassName={cn('max-h-48 w-56 overflow-y-auto')}
      >
        <DropdownContent
          isOpen={isExpanded}
          state={contentState}
          emptyContent={null}
          className={cn(
            'dark:bg-dark-bg border-border dark:border-dark-border rounded-lg border bg-white shadow-lg'
          )}
        >
          {visibleItems.map(ln => (
            <button
              key={ln.id}
              onClick={() => handleOpenLinkedNote(ln)}
              className={cn(
                'w-full',
                'flex',
                'items-center',
                'gap-2',
                'justify-between',
                'text-sm',
                'px-3',
                'py-2',
                'rounded',
                'hover:bg-gray-100',
                'dark:hover:bg-gray-800'
              )}
            >
              <span
                className={cn(
                  'truncate',
                  'text-text',
                  'text-text',
                  'dark:text-dark-text'
                )}
              >
                {ln.title || '(без названия)'}
              </span>
              <LinkIcon className={cn('h-4', 'w-4', 'text-secondary')} />
            </button>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default RelatedNotesDropdown;
