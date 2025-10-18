import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as UseFileTreeItem } from 'widgets/hooks/useFileTree';
import { useLocalization } from '../../../hooks';
import {
  useGetNotesQuery,
  useLazyGetNotesQuery,
  notesApi,
} from '../../../model/stores/api';
import { useAppSelector } from '../../../hooks/redux';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [trigger] = useLazyGetNotesQuery();
  const { t } = useLocalization();

  const { data: notesResponse, isLoading: isQueryLoading } = useGetNotesQuery(
    { layoutId: item.id, page: 1 },
    {
      skip: !isExpanded || item.type !== 'layout',
    }
  );

  useEffect(() => {
    setLoadedPages(new Set([1]));
    setHasMore(true);
    setCurrentPage(1);
    setIsInitialLoadDone(false);
    setIsLoadingMore(false);
  }, [item.id]);

  useEffect(() => {
    if (!isExpanded || item.type !== 'layout') return;
    if (!notesResponse) return;

    const notes = Array.isArray(notesResponse.data) ? notesResponse.data : [];
    const pagination = notesResponse.pagination;
    const more = pagination ? 1 < pagination.pages : false;

    setHasMore(more);
    setIsInitialLoadDone(true);

    if (onNotesLoaded) {
      const notesWithLayout = notes.map(note => ({
        ...note,
        layoutId: item.id,
      }));
      onNotesLoaded(item.id, notesWithLayout);
    }
  }, [notesResponse, isExpanded, item.id, onNotesLoaded]);

  const loadMore = async (page: number) => {
    if (!hasMore || page <= 1 || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const result = await trigger({ layoutId: item.id, page });

      if (result.error || !result.data) {
        setHasMore(false);
        return;
      }

      const { data: newNotes, pagination } = result.data;
      const validNotes = Array.isArray(newNotes) ? newNotes : [];
      const more = pagination ? page < pagination.pages : false;

      setLoadedPages(prev => new Set([...prev, page]));
      setHasMore(more);
      setCurrentPage(page);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const apiState = useAppSelector(state => state.api);
  const allNotes: Note[] = [];
  loadedPages.forEach(page => {
    const cachedData = notesApi.endpoints.getNotes.select({
      layoutId: item.id,
      page
    })({ api: apiState });
    if (cachedData?.data?.data) {
      allNotes.push(...cachedData.data.data);
    }
  });

  let contentState: 'loading' | 'notes' | 'empty' | null = null;
  if (!isExpanded || item.type !== 'layout') {
    contentState = null;
  } else if (!isInitialLoadDone && isQueryLoading) {
    contentState = 'loading';
  } else if (isInitialLoadDone && allNotes.length > 0) {
    contentState = 'notes';
  } else if (isInitialLoadDone) {
    contentState = 'empty';
  }

  return (
    <AnimatePresence mode='wait'>
      {contentState === 'loading' && (
        <motion.div
          key='loading'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className='mt-2 ml-6 overflow-hidden text-sm text-gray-500'
        >
          {t('fileTree:loading')}
        </motion.div>
      )}

      {contentState === 'notes' && (
        <motion.div
          key='notes'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className='overflow-hidden'
        >
          {allNotes.map(note => (
            <div key={note.id}>
              {renderChild?.(
                {
                  id: note.id,
                  type: 'note',
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
          {hasMore && (
            <div className='mt-1 ml-4'>
              <button
                onClick={() => loadMore(currentPage + 1)}
                disabled={isLoadingMore}
                className='text-primary hover:text-primary-dark rounded px-2 py-1 text-sm transition-colors disabled:opacity-50'
              >
                {isLoadingMore
                  ? t('fileTree:loading')
                  : t('fileTree:uploadMore')}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {contentState === 'empty' && (
        <motion.div
          key='empty'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className='mt-2 ml-6 overflow-hidden text-sm text-gray-500'
        >
          {t('fileTree:folderEmpty')}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
