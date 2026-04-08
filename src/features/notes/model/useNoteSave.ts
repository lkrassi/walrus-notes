import { notesApi, removeDraft, useUpdateNoteMutation } from '@/entities';
import type { Note } from '@/entities/note';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const clearNoteDraftInCaches = (
  dispatch: (action: unknown) => unknown,
  noteId: string,
  layoutId?: string
) => {
  if (!layoutId) {
    return;
  }

  dispatch(
    notesApi.util.updateQueryData(
      'getNotes',
      { layoutId, page: 1 },
      draftState => {
        const idx = draftState.data.findIndex(n => n.id === noteId);
        if (idx !== -1) {
          draftState.data[idx].draft = '';
        }
      }
    )
  );

  dispatch(
    notesApi.util.updateQueryData('getPosedNotes', { layoutId }, draftState => {
      const idx = draftState.data.findIndex(n => n.id === noteId);
      if (idx !== -1) {
        draftState.data[idx].draft = '';
      }
    })
  );

  dispatch(
    notesApi.util.updateQueryData(
      'getUnposedNotes',
      { layoutId },
      draftState => {
        const idx = draftState.data.findIndex(n => n.id === noteId);
        if (idx !== -1) {
          draftState.data[idx].draft = '';
        }
      }
    )
  );
};

const updateNoteInCaches = ({
  dispatch,
  noteId,
  layoutId,
  title,
  payload,
}: {
  dispatch: (action: unknown) => unknown;
  noteId: string;
  layoutId?: string;
  title: string;
  payload: string;
}) => {
  if (!layoutId) {
    return;
  }

  dispatch(
    notesApi.util.updateQueryData(
      'getNotes',
      { layoutId, page: 1 },
      draftState => {
        const idx = draftState.data.findIndex(n => n.id === noteId);
        if (idx !== -1) {
          draftState.data[idx].title = title;
          draftState.data[idx].payload = payload;
          draftState.data[idx].draft = '';
        }
      }
    )
  );

  dispatch(
    notesApi.util.updateQueryData('getPosedNotes', { layoutId }, draftState => {
      const idx = draftState.data.findIndex(n => n.id === noteId);
      if (idx !== -1) {
        draftState.data[idx].title = title;
        draftState.data[idx].payload = payload;
        draftState.data[idx].draft = '';
      }
    })
  );

  dispatch(
    notesApi.util.updateQueryData(
      'getUnposedNotes',
      { layoutId },
      draftState => {
        const idx = draftState.data.findIndex(n => n.id === noteId);
        if (idx !== -1) {
          draftState.data[idx].title = title;
          draftState.data[idx].payload = payload;
          draftState.data[idx].draft = '';
        }
      }
    )
  );
};

interface UseNoteSaveParams {
  note: Note;
  canWrite: boolean;
  title: string;
  setTitle: (value: string) => void;
  payload: string;
  setPayloadState: (value: string) => void;
  originalPayload: string;
  hasAnyDraftMarker: boolean;
  storedDraftText: string;
  serverDraft: string;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  ignoreDraftRef: { current: boolean };
  lastLocalCommitRef: { current: number | null };
  lastLocalUpdateRef: { current: number | null };
  hydratedServerPayloadRef: { current: string };
  commitDraft: (value?: string) => boolean;
  sendUpdateDraft: (value: string) => boolean;
  onNoteUpdated?: (note: Note) => void;
  showError: (message: string) => void;
  isRecordNotFound422: (error: unknown) => boolean;
  logDraft: (message: string, extra?: Record<string, unknown>) => void;
}

export const useNoteSave = ({
  note,
  canWrite,
  title,
  setTitle,
  payload,
  setPayloadState,
  originalPayload,
  hasAnyDraftMarker,
  storedDraftText,
  serverDraft,
  isEditing,
  setIsEditing,
  ignoreDraftRef,
  lastLocalCommitRef,
  lastLocalUpdateRef,
  hydratedServerPayloadRef,
  commitDraft,
  sendUpdateDraft,
  onNoteUpdated,
  showError,
  isRecordNotFound422,
  logDraft,
}: UseNoteSaveParams) => {
  const dispatch = useDispatch() as (action: unknown) => unknown;
  const [updateNote, { isLoading }] = useUpdateNoteMutation();

  const handleSave = useCallback(
    async (overrideTitle?: string) => {
      logDraft('save clicked', {
        canWrite,
        currentIsEditing: isEditing,
        notePayloadLength: (note.payload ?? '').length,
        noteDraftLength: (note.draft ?? '').length,
        storeDraftLength: storedDraftText.length,
        localPayloadLength: (payload ?? '').length,
      });

      if (!canWrite) {
        setIsEditing(false);
        logDraft('save ignored: no write access');
        return false;
      }

      const safeTitle =
        overrideTitle !== undefined ? overrideTitle : (title ?? '');
      const safePayload = payload ?? '';

      if (!safeTitle.trim()) {
        showError('notes:enterNoteTitle');
        logDraft('save blocked: empty title');
        return false;
      }

      const newTitle = safeTitle.trim();
      const newPayload = safePayload;

      if (newTitle === note.title && newPayload === note.payload) {
        if (hasAnyDraftMarker) {
          try {
            const res = commitDraft(newPayload);
            if (res) {
              lastLocalCommitRef.current = Date.now();
            }
            logDraft('save no-op, sent commit to clear draft marker', {
              commitSent: !!res,
              hasAnyDraftMarker,
              serverDraftLength: serverDraft.length,
              storeDraftLength: storedDraftText.length,
            });
          } catch (_e) {
            logDraft('save no-op, commitDraft threw while clearing marker');
          }

          try {
            ignoreDraftRef.current = true;
            dispatch(removeDraft({ noteId: note.id }));
          } catch (_e) {}

          try {
            clearNoteDraftInCaches(dispatch, note.id, note.layoutId);
          } catch (_e) {}
        }

        setIsEditing(false);
        logDraft('save short-circuited: no content changes');
        return true;
      }

      try {
        const response = await updateNote({
          noteId: note.id,
          title: newTitle,
          payload: newPayload,
        }).unwrap();

        const serverNote = response?.data;
        const finalTitle = serverNote?.title ?? newTitle;
        const finalPayload = serverNote?.payload ?? newPayload;
        const finalUpdatedAt =
          serverNote?.updatedAt ?? new Date().toISOString();

        try {
          const res = commitDraft(finalPayload);
          if (res) {
            lastLocalCommitRef.current = Date.now();
          }

          logDraft('commitDraft requested after updateNote', {
            commitSent: !!res,
            finalPayloadLength: finalPayload.length,
          });
        } catch (_e) {}

        try {
          setPayloadState(finalPayload);
        } catch (_e) {}

        try {
          ignoreDraftRef.current = true;
        } catch (_e) {}

        try {
          dispatch(removeDraft({ noteId: note.id }));
        } catch (_e) {}

        try {
          updateNoteInCaches({
            dispatch,
            noteId: note.id,
            layoutId: note.layoutId || serverNote?.layoutId,
            title: finalTitle,
            payload: finalPayload,
          });
        } catch (_e) {}

        const updatedNote: Note = {
          ...note,
          ...serverNote,
          title: finalTitle,
          payload: finalPayload,
          draft: '',
          updatedAt: finalUpdatedAt,
        };

        setTitle(finalTitle);
        setIsEditing(false);
        onNoteUpdated?.(updatedNote);

        logDraft('save succeeded and edit mode closed', {
          finalPayloadLength: finalPayload.length,
          finalTitleLength: finalTitle.length,
        });

        return true;
      } catch (error) {
        if (isRecordNotFound422(error)) {
          setIsEditing(true);
          logDraft('save failed with 422 record_not_found');
          return false;
        }

        showError('notes:noteUpdateError');
        setIsEditing(true);
        logDraft('save failed with generic error');
        return false;
      }
    },
    [
      canWrite,
      isEditing,
      note,
      storedDraftText.length,
      payload,
      title,
      showError,
      hasAnyDraftMarker,
      commitDraft,
      serverDraft.length,
      setIsEditing,
      updateNote,
      setTitle,
      onNoteUpdated,
      isRecordNotFound422,
      logDraft,
      lastLocalCommitRef,
      ignoreDraftRef,
      dispatch,
      setPayloadState,
    ]
  );

  const handleDiscard = useCallback(async () => {
    try {
      ignoreDraftRef.current = true;

      try {
        setPayloadState(originalPayload);
        hydratedServerPayloadRef.current = originalPayload;
        lastLocalUpdateRef.current = null;
      } catch (_e) {}

      setIsEditing(false);

      try {
        sendUpdateDraft('');
      } catch (_e) {}
      try {
        dispatch(removeDraft({ noteId: note.id }));
      } catch (_e) {}

      try {
        clearNoteDraftInCaches(dispatch, note.id, note.layoutId);
      } catch (_e) {}

      if (onNoteUpdated) {
        onNoteUpdated({
          ...note,
          draft: '',
        });
      }

      logDraft('discard completed');
    } catch (_e) {}
    return true;
  }, [
    dispatch,
    hydratedServerPayloadRef,
    ignoreDraftRef,
    lastLocalUpdateRef,
    logDraft,
    note,
    onNoteUpdated,
    originalPayload,
    sendUpdateDraft,
    setIsEditing,
    setPayloadState,
  ]);

  return {
    isLoading,
    handleSave,
    handleDiscard,
  } as const;
};
