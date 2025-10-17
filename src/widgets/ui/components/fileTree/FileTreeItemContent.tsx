import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as UseFileTreeItem } from 'widgets/hooks/useFileTree';
import { useGetNotesQuery, useLazyGetNotesQuery } from '../../../model/stores/api';

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
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [trigger] = useLazyGetNotesQuery();

  const { data: notesResponse, isLoading: isQueryLoading } = useGetNotesQuery(
    { layoutId: item.id, page: 1 },
    {
      skip: !isExpanded || item.type !== 'layout',
    }
  );

  useEffect(() => {
    setAllNotes([]);
    setHasMore(true);
    setCurrentPage(1);
    setIsLoading(false);
  }, [item.id]);

  useEffect(() => {
    if (notesResponse?.data && Array.isArray(notesResponse.data)) {
      setAllNotes(notesResponse.data);
      setHasMore(notesResponse.pagination ? currentPage < notesResponse.pagination.pages : false);
      setCurrentPage(1);

      if (onNotesLoaded) {
        const notesWithLayout = notesResponse.data.map(note => ({
          ...note,
          layoutId: item.id,
        }));
        onNotesLoaded(item.id, notesWithLayout);
      }
    }
  }, [notesResponse?.data, item.id, onNotesLoaded, currentPage]);

  async function loadPage(page: number) {
    if (!hasMore && page > 1) return;

    setIsLoading(true);
    try {
      const result = await trigger({ layoutId: item.id, page });

      if (result.error) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      if (!result.data) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const notesResponse = result.data;
      const notesData = notesResponse.data;

      let newNotes: Note[] = [];
      if (Array.isArray(notesData)) {
        newNotes = notesData;
      }

      const pagination = notesResponse.pagination;

      let more = false;
      if (pagination) {
        more = page < pagination.pages;
      }

      if (page === 1) {
        setAllNotes(newNotes);
      } else {
        setAllNotes(prev => [...prev, ...newNotes]);
      }

      setHasMore(more);
      setCurrentPage(page);

      if (onNotesLoaded) {
        onNotesLoaded(
          item.id,
          page === 1 ? newNotes : [...allNotes, ...newNotes]
        );
      }
    } catch (err) {
      setHasMore(false);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (isExpanded && item.type === 'layout' && allNotes.length === 0 && !notesResponse?.data) {
      loadPage(1);
    }
  }, [isExpanded, item.id, allNotes.length, notesResponse?.data]);

  return (
    <AnimatePresence>
      {isExpanded && item.type === 'layout' && (
        <>
          {(isLoading || isQueryLoading) && currentPage === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className='mt-2 ml-6 text-sm text-gray-500'
            >
              Загрузка заметок...
            </motion.div>
          )}

          {allNotes.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='overflow-hidden'
            >
              {allNotes.map(note => (
                <div key={note.id}>
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
              {hasMore && (
                <div className='mt-1 ml-4'>
                  <button
                    onClick={() => loadPage(currentPage + 1)}
                    disabled={isLoading}
                    className='text-primary hover:text-primary-dark rounded px-2 py-1 text-sm transition-colors disabled:opacity-50'
                  >
                    {isLoading && currentPage > 1
                      ? 'Загрузка...'
                      : 'Загрузить ещё...'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
