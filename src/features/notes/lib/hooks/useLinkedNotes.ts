import { notesApi, useGetNotesQuery } from '@/entities';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

type RootStateLike = {
  api: unknown;
};

interface UseLinkedNotesProps {
  layoutId?: string | null;
  linkedInIds?: string[];
  linkedOutIds?: string[];
}

export const useLinkedNotes = ({
  layoutId,
  linkedInIds = [],
  linkedOutIds = [],
}: UseLinkedNotesProps) => {
  const shouldSkip =
    !layoutId ||
    ((!linkedInIds || linkedInIds.length === 0) &&
      (!linkedOutIds || linkedOutIds.length === 0));

  const { data: notesResponse, isLoading } = useGetNotesQuery(
    { layoutId: layoutId || '', page: 1 },
    { skip: shouldSkip }
  );

  const cachedNotes = useSelector(
    state =>
      notesApi.endpoints.getNotes.select({ layoutId: layoutId || '', page: 1 })(
        state as RootStateLike
      )?.data?.data
  );

  const allNotes = useMemo(
    () => notesResponse?.data || cachedNotes || [],
    [notesResponse?.data, cachedNotes]
  );

  const linkedNotesIn = useMemo(
    () => allNotes.filter(n => linkedInIds.includes(n.id)),
    [allNotes, linkedInIds]
  );

  const linkedNotesOut = useMemo(
    () => allNotes.filter(n => linkedOutIds.includes(n.id)),
    [allNotes, linkedOutIds]
  );

  return {
    linkedNotesIn,
    linkedNotesOut,
    isLoading,
  };
};
