import { useGetUnposedNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { useEffect, useMemo, useState } from 'react';

interface UseUnposedNotesDataParams {
  layoutId: string;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}

export const useUnposedNotesData = ({
  layoutId,
  isOpen,
  onOpenChange,
}: UseUnposedNotesDataParams) => {
  const { data: unposedNotesResponse, isLoading } = useGetUnposedNotesQuery({
    layoutId,
  });

  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const unposedNotes = unposedNotesResponse?.data || [];

  const noteMap = useMemo(
    () => new Map(unposedNotes.map(note => [note.id, note])),
    [unposedNotes]
  );

  useEffect(() => {
    const nextIds = unposedNotes.map(note => note.id);
    setOrderedIds(prev => {
      const kept = prev.filter(id => nextIds.includes(id));
      const appended = nextIds.filter(id => !kept.includes(id));
      return [...kept, ...appended];
    });
  }, [unposedNotes]);

  const orderedNotes = useMemo(
    () => orderedIds.map(id => noteMap.get(id)).filter(Boolean) as Note[],
    [orderedIds, noteMap]
  );

  useEffect(() => {
    if (!isLoading && orderedNotes.length === 0 && isOpen) {
      onOpenChange(false);
    }
  }, [isLoading, orderedNotes.length, isOpen, onOpenChange]);

  return {
    isLoading,
    orderedIds,
    setOrderedIds,
    orderedNotes,
  } as const;
};
