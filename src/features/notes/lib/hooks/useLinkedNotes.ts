import { notesApi, useGetNotesQuery, useLazyGetNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type NotesApiRootState = Parameters<
  ReturnType<typeof notesApi.endpoints.getNotes.select>
>[0];

interface UseLinkedNotesProps {
  layoutId?: string | null;
  noteId?: string;
  linkedInIds?: string[];
  linkedOutIds?: string[];
}

export const useLinkedNotes = ({
  layoutId,
  noteId,
  linkedInIds = [],
  linkedOutIds = [],
}: UseLinkedNotesProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestedPagesRef = useRef<Set<number>>(new Set([1]));

  const linkedInUnique = useMemo(
    () => Array.from(new Set(linkedInIds)),
    [linkedInIds]
  );
  const linkedOutUnique = useMemo(
    () => Array.from(new Set(linkedOutIds)),
    [linkedOutIds]
  );

  const shouldSkip =
    !layoutId ||
    ((!linkedInUnique || linkedInUnique.length === 0) &&
      (!linkedOutUnique || linkedOutUnique.length === 0));

  const { data: notesResponse, isLoading } = useGetNotesQuery(
    { layoutId: layoutId || '', page: 1 },
    { skip: shouldSkip }
  );

  const [getNotesPage] = useLazyGetNotesQuery();

  const apiQueries = useSelector(
    (state: NotesApiRootState) => state.api?.queries || {}
  );

  const cachedPagesData = useMemo(() => {
    const pages = new Map<number, Note[]>();

    Object.values(apiQueries).forEach(queryEntry => {
      const entry = queryEntry as {
        endpointName?: string;
        originalArgs?: unknown;
        data?: { data?: Note[] };
      };

      if (entry.endpointName !== 'getNotes') return;
      if (!entry.originalArgs || typeof entry.originalArgs !== 'object') return;

      const args = entry.originalArgs as { layoutId?: string; page?: number };
      if (!layoutId || args.layoutId !== layoutId) return;

      const page = Number(args.page || 1);
      const notes = entry.data?.data;
      if (!Array.isArray(notes)) return;

      if (!pages.has(page)) {
        pages.set(page, notes);
      }
    });

    return pages;
  }, [apiQueries, layoutId]);

  const cachedPages = useMemo(
    () => Array.from(cachedPagesData.keys()).sort((a, b) => a - b),
    [cachedPagesData]
  );

  const totalPages = useMemo(() => {
    const fromResponse = Number(notesResponse?.pagination?.pages || 0);
    if (fromResponse > 0) return fromResponse;

    const fromCache = cachedPages.length ? Math.max(...cachedPages) : 1;
    return fromCache > 0 ? fromCache : 1;
  }, [notesResponse?.pagination?.pages, cachedPages]);

  const allNotes = useMemo(() => {
    const notesMap = new Map<string, Note>();

    cachedPages.forEach(page => {
      const notes = cachedPagesData.get(page) || [];
      notes.forEach(note => {
        if (!notesMap.has(note.id)) {
          notesMap.set(note.id, note);
        }
      });
    });

    return Array.from(notesMap.values());
  }, [cachedPages, cachedPagesData]);

  const notesById = useMemo(() => {
    const map = new Map<string, Note>();
    allNotes.forEach(note => {
      map.set(note.id, note);
    });
    return map;
  }, [allNotes]);

  const currentNoteFromCache = useMemo(() => {
    if (!noteId) return undefined;
    return notesById.get(noteId);
  }, [noteId, notesById]);

  const effectiveLinkedInIds = useMemo<string[]>(() => {
    if (currentNoteFromCache) {
      return Array.from(new Set(currentNoteFromCache.linkedWithIn ?? []));
    }

    return linkedInUnique;
  }, [currentNoteFromCache, linkedInUnique]);

  const effectiveLinkedOutIds = useMemo<string[]>(() => {
    if (currentNoteFromCache) {
      return Array.from(new Set(currentNoteFromCache.linkedWithOut ?? []));
    }

    return linkedOutUnique;
  }, [currentNoteFromCache, linkedOutUnique]);

  const missingLinkedIds = useMemo(() => {
    const allLinked = new Set([
      ...effectiveLinkedInIds,
      ...effectiveLinkedOutIds,
    ]);
    return Array.from(allLinked).filter(id => !notesById.has(id));
  }, [effectiveLinkedInIds, effectiveLinkedOutIds, notesById]);

  const isCurrentNoteMissingInCache = !!noteId && !currentNoteFromCache;

  useEffect(() => {
    requestedPagesRef.current = new Set([1]);
  }, [layoutId]);

  useEffect(() => {
    if (!layoutId || shouldSkip) return;
    if (missingLinkedIds.length === 0 && !isCurrentNoteMissingInCache) return;
    if (totalPages <= 1) return;

    const pagesToLoad: number[] = [];
    for (let page = 2; page <= totalPages; page += 1) {
      const hasCachedPage = cachedPagesData.has(page);
      const wasRequested = requestedPagesRef.current.has(page);

      if (!hasCachedPage && !wasRequested) {
        pagesToLoad.push(page);
      }
    }

    if (pagesToLoad.length === 0) return;

    let isCancelled = false;

    const loadMissingPages = async () => {
      setIsLoadingMore(true);
      try {
        for (const page of pagesToLoad) {
          if (isCancelled) return;

          requestedPagesRef.current.add(page);
          try {
            await getNotesPage({ layoutId, page }, true).unwrap();
          } catch (_e) {}
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMore(false);
        }
      }
    };

    void loadMissingPages();

    return () => {
      isCancelled = true;
    };
  }, [
    layoutId,
    shouldSkip,
    missingLinkedIds,
    isCurrentNoteMissingInCache,
    totalPages,
    cachedPagesData,
    getNotesPage,
  ]);

  const linkedNotesIn = useMemo(
    () =>
      effectiveLinkedInIds
        .map(id => notesById.get(id))
        .filter((note): note is Note => !!note),
    [effectiveLinkedInIds, notesById]
  );

  const linkedNotesOut = useMemo(
    () =>
      effectiveLinkedOutIds
        .map(id => notesById.get(id))
        .filter((note): note is Note => !!note),
    [effectiveLinkedOutIds, notesById]
  );

  return {
    linkedNotesIn,
    linkedNotesOut,
    isLoading: isLoading || isLoadingMore,
  };
};
