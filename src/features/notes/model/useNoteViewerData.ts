import {
  getLayoutAccess,
  useDrafts,
  useGetMyLayoutsQuery,
  useGetNotesQuery,
} from '@/entities';
import type { Note } from '@/entities/note';
import { useEffect, useState } from 'react';

interface UseNoteViewerDataParams {
  note: Note;
  layoutId?: string;
}

export const useNoteViewerData = ({
  note,
  layoutId,
}: UseNoteViewerDataParams) => {
  const resolvedLayoutId = layoutId || note.layoutId || '';
  const [isHydrated, setIsHydrated] = useState(false);

  const { drafts } = useDrafts();
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const {
    data: notesResponse,
    isFetching: isNotesFetching,
    isLoading: isNotesLoading,
    isUninitialized: isNotesUninitialized,
    refetch,
  } = useGetNotesQuery(
    { layoutId: resolvedLayoutId, page: 1 },
    {
      skip: !resolvedLayoutId,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (!resolvedLayoutId) {
      setIsHydrated(false);
      return;
    }

    setIsHydrated(false);
    void refetch();
  }, [refetch, resolvedLayoutId]);

  const liveNote = notesResponse?.data?.find(n => n.id === note.id);
  const effectiveNote = liveNote ?? note;

  const storeDraft = drafts[note.id] ?? '';

  const currentLayout = (layoutsResponse?.data || []).find(
    l => l.id === resolvedLayoutId
  );
  const canWrite = currentLayout
    ? getLayoutAccess(currentLayout).canWrite
    : true;

  const hasAnyDraft = !!(
    storeDraft?.trim() ||
    effectiveNote.draft?.trim() ||
    note.draft?.trim()
  );

  const isNotesHydrating =
    !!resolvedLayoutId &&
    (isNotesUninitialized || isNotesLoading || isNotesFetching);

  const isServerNotePending =
    canWrite &&
    !!resolvedLayoutId &&
    !liveNote &&
    !hasAnyDraft &&
    isNotesHydrating;

  useEffect(() => {
    if (!resolvedLayoutId) {
      return;
    }

    if (isNotesHydrating) {
      return;
    }

    setIsHydrated(true);
  }, [isNotesHydrating, resolvedLayoutId]);

  const shouldDelayContent =
    !isHydrated ||
    (canWrite && !!resolvedLayoutId && !hasAnyDraft
      ? isNotesHydrating || isServerNotePending
      : false);

  return {
    resolvedLayoutId,
    effectiveNote,
    canWrite,
    shouldDelayContent,
    isHydrated,
  } as const;
};
