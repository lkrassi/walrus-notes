import { notesApi, useGetNotesQuery, useLazyGetNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { useAppSelector } from '@/widgets/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

type NotesApiRootState = Parameters<
  ReturnType<typeof notesApi.endpoints.getNotes.select>
>[0];

interface UseFileTreeLayoutNotesDataOptions {
  layoutId: string;
  isExpanded: boolean;
  onNotesLoaded?: (layoutId: string, notes: Note[]) => void;
}

export const useFileTreeLayoutNotesData = ({
  layoutId,
  isExpanded,
  onNotesLoaded,
}: UseFileTreeLayoutNotesDataOptions) => {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { data: notesResponse, isLoading: isQueryLoading } = useGetNotesQuery(
    { layoutId, page: 1 },
    { skip: !isExpanded }
  );

  const [triggerGetNotes] = useLazyGetNotesQuery();

  useEffect(() => {
    setLoadedPages(new Set([1]));
    setHasMore(true);
    setIsInitialLoadDone(false);
    setTotalPages(1);
  }, [layoutId]);

  useEffect(() => {
    if (!isExpanded || !notesResponse) {
      return;
    }

    const notes = Array.isArray(notesResponse.data) ? notesResponse.data : [];
    const pagination = notesResponse.pagination;

    if (pagination) {
      setTotalPages(pagination.pages);
      setHasMore(1 < pagination.pages);
    }

    setIsInitialLoadDone(true);

    if (onNotesLoaded && notes.length > 0) {
      const notesWithLayout = notes.map(note => ({
        ...note,
        layoutId,
      }));
      onNotesLoaded(layoutId, notesWithLayout);
    }
  }, [notesResponse, isExpanded, layoutId, onNotesLoaded]);

  const apiState = useAppSelector(
    state => state.api as NotesApiRootState['api']
  );

  const allNotes = useMemo(() => {
    const notesMap = new Map<string, Note>();

    for (const page of loadedPages) {
      const cachedData = notesApi.endpoints.getNotes.select({
        layoutId,
        page,
      })({ api: apiState } as NotesApiRootState);

      if (cachedData?.data?.data) {
        for (const note of cachedData.data.data) {
          if (!notesMap.has(note.id)) {
            notesMap.set(note.id, note);
          }
        }
      }
    }

    return Array.from(notesMap.values());
  }, [loadedPages, apiState, layoutId]);

  const loadMoreNotes = useCallback(
    async (page: number) => {
      if (!hasMore || page <= 1) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await triggerGetNotes({ layoutId, page }).unwrap();

        if (result.data) {
          setLoadedPages(prev => new Set([...prev, page]));
          setHasMore(page < totalPages);

          if (onNotesLoaded && result.data.length > 0) {
            const notesWithLayout = result.data.map(note => ({
              ...note,
              layoutId,
            }));
            onNotesLoaded(layoutId, notesWithLayout);
          }
        }
      } catch (_error) {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, triggerGetNotes, layoutId, totalPages, onNotesLoaded]
  );

  const handleLoadMore = useCallback(() => {
    const nextPage = Math.max(...loadedPages) + 1;
    loadMoreNotes(nextPage);
  }, [loadedPages, loadMoreNotes]);

  return {
    allNotes,
    hasMore,
    isLoading,
    isInitialLoadDone,
    isQueryLoading,
    handleLoadMore,
  } as const;
};
