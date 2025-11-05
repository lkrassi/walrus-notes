import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as UseFileTreeItem } from 'widgets/hooks/useFileTree';
import { useLocalization } from '../../../hooks';
import { useAppSelector } from '../../../hooks/redux';
import { useDropdown } from '../../../hooks/useDropdown';
import {
  notesApi,
  useGetNotesQuery,
  useLazyGetNotesQuery,
} from '../../../model';
import { DropdownContent } from '../dropdown/DropdownContent';
import { LoadMoreButton } from '../dropdown/LoadMoreButton';

type FileTreeItemContentProps = {
  item: UseFileTreeItem;
  level: number;
  isExpanded: boolean;
  renderChild?: (child: UseFileTreeItem, level: number) => React.ReactNode;
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

  const { t } = useLocalization();

  const { data: notesResponse, isLoading: isQueryLoading } = useGetNotesQuery(
    { layoutId: item.id, page: 1 },
    {
      skip: !isExpanded || item.type !== 'layout',
    }
  );

  const [triggerGetNotes, { isLoading: isLoadMoreLoading }] =
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

  const apiState = useAppSelector(state => state.api);

  const allNotes = useMemo(() => {
    const notesMap = new Map<string, Note>();

    loadedPages.forEach(page => {
      const cachedData = notesApi.endpoints.getNotes.select({
        layoutId: item.id,
        page,
      })({ api: apiState });

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
      if (!hasMore || page <= 1) return;

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
      }
    },
    [hasMore, triggerGetNotes, item.id, totalPages, onNotesLoaded]
  );

  const {
    visibleItems,
    isLoadingMore,
    hasMore: dropdownHasMore,
    loadMore: dropdownLoadMore,
  } = useDropdown({
    items: allNotes,
    isOpen: isExpanded && item.type === 'layout',
    hasMore: hasMore,
    onLoadMore: loadMoreNotes,
  });

  let contentState: 'loading' | 'content' | 'empty' = 'empty';

  if (!isExpanded || item.type !== 'layout') {
    return null;
  }

  if (!isInitialLoadDone && isQueryLoading) {
    contentState = 'loading';
  } else if (isInitialLoadDone && allNotes.length > 0) {
    contentState = 'content';
  } else if (isInitialLoadDone) {
    contentState = 'empty';
  }

  return (
    <DropdownContent
      isOpen={isExpanded && item.type === 'layout'}
      state={contentState}
      emptyContent={
        <div className='mt-2 ml-6 text-sm text-gray-500'>
          {t('fileTree:folderEmpty')}
        </div>
      }
      className='overflow-hidden'
    >
      <div>
        {visibleItems.map(note => (
          <div key={`${note.id}-${note.updatedAt || note.createdAt}`}>
            {renderChild?.(
              {
                id: note.id,
                type: 'note' as const,
                title: note.title,
                parentId: item.id,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                note,
              },
              level + 1
            )}
          </div>
        ))}

        <LoadMoreButton
          hasMore={dropdownHasMore}
          isLoading={isLoadingMore || isLoadMoreLoading}
          onLoadMore={dropdownLoadMore}
          loadingText={t('fileTree:loading')}
          loadMoreText={t('fileTree:uploadMore')}
          className='ml-4'
        />
      </div>
    </DropdownContent>
  );
};
