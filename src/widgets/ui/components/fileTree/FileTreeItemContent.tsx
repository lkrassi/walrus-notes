import { notesApi, useGetNotesQuery, useLazyGetNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem as UseFileTreeItem } from '@/entities/tab';
import { CreateNoteForm } from '@/features/notes';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS } from '@/shared/lib/react';
import { DropdownContent } from '@/shared/ui';
import { useLocalization, useModalActions } from '@/widgets/hooks';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSelector } from 'react-redux';

type NotesApiRootState = Parameters<
  ReturnType<typeof notesApi.endpoints.getNotes.select>
>[0];

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
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const canWrite = item.access ? !!item.access.canWrite : true;

  const handleCreateNote = openModalFromTrigger(
    <CreateNoteForm layoutId={item.id} />,
    {
      title: t('fileTree:createNewNote'),
      size: MODAL_SIZE_PRESETS.noteCreate,
    }
  );

  const { data: notesResponse, isLoading: isQueryLoading } = useGetNotesQuery(
    { layoutId: item.id, page: 1 },
    {
      skip: !isExpanded || item.type !== 'layout',
    }
  );

  const [triggerGetNotes, { isLoading: _isLoadMoreLoading }] =
    useLazyGetNotesQuery();

  useEffect(() => {
    setLoadedPages(new Set([1]));
    setHasMore(true);
    setIsInitialLoadDone(false);
    setTotalPages(1);
  }, [item.id]);

  useEffect(() => {
    if (!isExpanded || item.type !== 'layout' || !notesResponse) return;

    const notes = Array.isArray(notesResponse.data) ? notesResponse.data : [];
    const pagination = notesResponse.pagination;

    if (pagination) {
      setTotalPages(pagination.pages);
      const more = 1 < pagination.pages;
      setHasMore(more);
    }

    setIsInitialLoadDone(true);

    if (onNotesLoaded && notes.length > 0) {
      const notesWithLayout = notes.map(note => ({
        ...note,
        layoutId: item.id,
      }));
      onNotesLoaded(item.id, notesWithLayout);
    }
  }, [notesResponse, isExpanded, item.id, onNotesLoaded]);

  const apiState = useSelector((state: NotesApiRootState) => state.api);

  const allNotes = useMemo(() => {
    const notesMap = new Map<string, Note>();

    loadedPages.forEach(page => {
      const cachedData = notesApi.endpoints.getNotes.select({
        layoutId: item.id,
        page,
      })({ api: apiState } as NotesApiRootState);

      if (cachedData?.data?.data) {
        cachedData.data.data.forEach(note => {
          if (!notesMap.has(note.id)) {
            notesMap.set(note.id, note);
          }
        });
      }
    });

    return Array.from(notesMap.values());
  }, [loadedPages, apiState, item.id]);

  const loadMoreNotes = useCallback(
    async (page: number) => {
      if (!hasMore || page <= 1) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await triggerGetNotes({
          layoutId: item.id,
          page,
        }).unwrap();

        if (result.data) {
          setLoadedPages(prev => new Set([...prev, page]));

          const more = page < totalPages;
          setHasMore(more);

          if (onNotesLoaded && result.data.length > 0) {
            const notesWithLayout = result.data.map(note => ({
              ...note,
              layoutId: item.id,
            }));
            onNotesLoaded(item.id, notesWithLayout);
          }
        }
      } catch (_error) {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, triggerGetNotes, item.id, totalPages, onNotesLoaded]
  );

  const handleLoadMore = useCallback(() => {
    const nextPage = Math.max(...loadedPages) + 1;
    loadMoreNotes(nextPage);
  }, [loadedPages, loadMoreNotes]);

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
        <div className={cn('mt-2', 'ml-12', 'pb-2', 'text-sm', 'muted-text')}>
          {canWrite && (
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                handleCreateNote(e);
              }}
              className={cn(
                'text-primary dark:text-dark-primary font-medium',
                'transition-opacity duration-150 hover:opacity-80'
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
          <div
            key={`${note.id}-${note.updatedAt || note.createdAt}`}
            className={cn('mt-1')}
          >
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
          <div className={cn('mt-2', 'ml-12')}>
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                handleCreateNote(e);
              }}
              className={cn(
                'text-sm',
                'font-medium',
                'text-primary',
                'dark:text-primary-dark',
                'hover:opacity-80',
                'transition-opacity',
                'duration-150'
              )}
              title={createNoteLabel}
            >
              {createNoteLabel}
            </button>
          </div>
        )}
        {hasMore && isInitialLoadDone && (
          <div className={cn('mt-3', 'ml-6', 'pb-2')}>
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={cn(
                'text-sm',
                'font-medium',
                'text-primary',
                'dark:text-primary-dark',
                'hover:opacity-80',
                'transition-opacity',
                'duration-150',
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
