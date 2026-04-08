import type { Note } from '@/entities/note';
import type { FileTreeItem as UseFileTreeItem } from '@/entities/tab';
import { CreateNoteForm } from '@/features/notes';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS } from '@/shared/lib/react';
import { DropdownContent } from '@/shared/ui';
import { useLocalization, useModalActions } from '@/widgets/hooks';
import { type ReactNode } from 'react';
import { useFileTreeLayoutNotesData } from './model/useFileTreeLayoutNotesData';

type FileTreeItemContentProps = {
  item: UseFileTreeItem;
  level: number;
  isExpanded: boolean;
  renderChild?: (child: UseFileTreeItem, level: number) => ReactNode;
  onNotesLoaded?: (layoutId: string, notes: Note[]) => void;
};

export const FileTreeItemContent = ({
  item,
  level,
  isExpanded,
  renderChild,
  onNotesLoaded,
}: FileTreeItemContentProps) => {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const canWrite = item.access ? !!item.access.canWrite : true;

  const {
    allNotes,
    hasMore,
    isLoading,
    isInitialLoadDone,
    isQueryLoading,
    handleLoadMore,
  } = useFileTreeLayoutNotesData({
    layoutId: item.id,
    isExpanded: isExpanded && item.type === 'layout',
    onNotesLoaded,
  });

  const handleCreateNote = openModalFromTrigger(
    <CreateNoteForm layoutId={item.id} />,
    {
      title: t('fileTree:createNewNote'),
      size: MODAL_SIZE_PRESETS.noteCreate,
    }
  );

  let contentState: 'loading' | 'content' | 'empty' = 'empty';

  if (!isExpanded || item.type !== 'layout') {
    contentState = 'empty';
  } else if (!isInitialLoadDone && isQueryLoading) {
    contentState = 'loading';
  } else if (isInitialLoadDone && allNotes.length > 0) {
    contentState = 'content';
  } else if (isInitialLoadDone) {
    contentState = 'empty';
  }

  const createNoteLabel =
    allNotes.length > 0 ? t('fileTree:addMore') : t('fileTree:addNote');

  return (
    <DropdownContent
      isOpen={isExpanded && item.type === 'layout'}
      state={contentState}
      className={cn('overflow-hidden')}
      emptyContent={
        <div
          className={cn(
            'mt-1',
            'ml-8',
            'pb-1',
            'text-xs',
            'muted-text',
            'min-h-5',
            'flex',
            'items-center'
          )}
        >
          {canWrite && (
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                handleCreateNote(e);
              }}
              className={cn(
                'text-foreground dark:text-dark-text font-semibold',
                'transition-colors duration-150',
                'hover:text-primary dark:hover:text-dark-primary'
              )}
              title={createNoteLabel}
            >
              {createNoteLabel}
            </button>
          )}
        </div>
      }
    >
      <div>
        {allNotes.map(note => (
          <div key={note.id} className={cn('mt-0')}>
            {renderChild?.(
              {
                id: note.id,
                type: 'note' as const,
                title: note.title,
                isMain: note.isMain,
                parentId: item.id,
                access: item.access,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                note,
              },
              level + 1
            )}
          </div>
        ))}
        {isInitialLoadDone && canWrite && (
          <div
            className={cn('mt-1', 'ml-8', 'min-h-5', 'flex', 'items-center')}
          >
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                handleCreateNote(e);
              }}
              className={cn(
                'text-xs',
                'font-semibold',
                'text-foreground',
                'dark:text-dark-text',
                'transition-colors',
                'duration-150',
                'hover:text-primary',
                'dark:hover:text-dark-primary'
              )}
              title={createNoteLabel}
            >
              {createNoteLabel}
            </button>
          </div>
        )}
        {hasMore && isInitialLoadDone && (
          <div
            className={cn(
              'mt-1',
              'ml-6',
              'pb-1',
              'min-h-5',
              'flex',
              'items-center'
            )}
          >
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={cn(
                'text-xs',
                'font-semibold',
                'text-foreground',
                'dark:text-dark-text',
                'transition-colors',
                'duration-150',
                'hover:text-primary',
                'dark:hover:text-dark-primary',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              {isLoading
                ? `${t('fileTree:loading')}...`
                : t('fileTree:showMore')}
            </button>
          </div>
        )}
      </div>
    </DropdownContent>
  );
};
