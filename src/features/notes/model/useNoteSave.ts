import { removeDraft, useUpdateNoteMutation } from '@/entities';
import type { Note } from '@/entities/note';
import { handleError } from '@/shared';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateNoteCacheFields } from './draft-sync/cacheUpdates';

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
  logDraft,
}: UseNoteSaveParams) => {
  const dispatch = useDispatch() as (action: unknown) => unknown;
  const [updateNote] = useUpdateNoteMutation();
  const isLoading = false;
  const handleNoteError = useCallback(
    (error: unknown, message = 'notes:noteUpdateError') => {
      handleError(error, {
        type: 'note-save',
        message,
        notify: showError,
      });
    },
    [showError]
  );

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

      if (newTitle !== note.title) {
        logDraft('save keeps title unchanged in draft flow', {
          currentTitleLength: (note.title ?? '').length,
          requestedTitleLength: newTitle.length,
        });
      }

      if (newTitle === note.title && newPayload === note.payload) {
        if (hasAnyDraftMarker) {
          let noOpSyncFailed = false;
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
          } catch (error) {
            logDraft('save no-op, commitDraft threw while clearing marker', {
              error: String(error),
            });
            handleNoteError(error);
            noOpSyncFailed = true;
          }

          try {
            ignoreDraftRef.current = true;
            dispatch(removeDraft({ noteId: note.id }));
          } catch (error) {
            logDraft('failed to clear local draft marker in no-op save', {
              error: String(error),
            });
            handleNoteError(error);
            noOpSyncFailed = true;
          }

          try {
            updateNoteCacheFields({
              dispatch,
              layoutIds: note.layoutId ? [note.layoutId] : [],
              noteId: note.id,
              updates: {
                draft: '',
              },
            });
          } catch (error) {
            logDraft('failed to clear draft caches in no-op save', {
              error: String(error),
            });
            handleNoteError(error);
            noOpSyncFailed = true;
          }

          if (noOpSyncFailed) {
            setIsEditing(true);
            return false;
          }
        }

        setIsEditing(false);
        logDraft('save short-circuited: no content changes');
        return true;
      }

      try {
        const updateResponse = await updateNote({
          noteId: note.id,
          title: newTitle,
          payload: newPayload,
        }).unwrap();

        const serverNote = updateResponse?.data;
        const finalTitle =
          serverNote?.title && serverNote.title.trim().length > 0
            ? serverNote.title.trim()
            : newTitle;
        const finalPayload = serverNote?.payload ?? newPayload;
        const finalUpdatedAt =
          serverNote?.updatedAt ?? note.updatedAt ?? new Date().toISOString();

        let postSaveSyncFailed = false;

        try {
          const res = commitDraft(finalPayload);
          if (res) {
            lastLocalCommitRef.current = Date.now();
          }

          logDraft('commitDraft requested after updateNote', {
            commitSent: !!res,
            finalPayloadLength: finalPayload.length,
          });

          if (!res) {
            postSaveSyncFailed = true;
          }
        } catch (error) {
          logDraft('commitDraft failed in save flow', {
            error: String(error),
          });
          handleNoteError(error);
          postSaveSyncFailed = true;
        }

        try {
          setPayloadState(finalPayload);
        } catch (error) {
          logDraft('setPayloadState failed in save flow', {
            error: String(error),
          });
          handleNoteError(error);
          postSaveSyncFailed = true;
        }

        try {
          ignoreDraftRef.current = true;
        } catch (error) {
          logDraft('failed to set ignoreDraftRef in save flow', {
            error: String(error),
          });
          handleNoteError(error);
          postSaveSyncFailed = true;
        }

        try {
          dispatch(removeDraft({ noteId: note.id }));
        } catch (error) {
          logDraft('failed to clear local draft in save flow', {
            error: String(error),
          });
          handleNoteError(error);
          postSaveSyncFailed = true;
        }

        try {
          updateNoteCacheFields({
            dispatch,
            layoutIds: note.layoutId ? [note.layoutId] : [],
            noteId: note.id,
            updates: {
              title: finalTitle,
              payload: finalPayload,
              draft: '',
            },
          });
        } catch (error) {
          logDraft('failed to update note caches in save flow', {
            error: String(error),
          });
          handleNoteError(error);
          postSaveSyncFailed = true;
        }

        if (postSaveSyncFailed) {
          setIsEditing(true);
          return false;
        }

        const updatedNote: Note = {
          ...note,
          ...(serverNote ?? {}),
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
        handleNoteError(error);
        setIsEditing(true);
        logDraft('save failed with generic error');
        return false;
      }
    },
    [
      canWrite,
      isEditing,
      note,
      updateNote,
      storedDraftText.length,
      payload,
      title,
      showError,
      hasAnyDraftMarker,
      commitDraft,
      serverDraft.length,
      setIsEditing,
      setTitle,
      onNoteUpdated,
      logDraft,
      handleNoteError,
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
      } catch (error) {
        logDraft('discard failed to reset local payload state', {
          error: String(error),
        });
        handleNoteError(error);
        return false;
      }

      setIsEditing(false);

      try {
        const sent = sendUpdateDraft('');
        if (!sent) {
          logDraft('discard failed to enqueue empty draft update');
          handleNoteError(new Error('sendUpdateDraft returned false'));
          return false;
        }
      } catch (error) {
        logDraft('discard failed to send empty draft update', {
          error: String(error),
        });
        handleNoteError(error);
        return false;
      }
      try {
        dispatch(removeDraft({ noteId: note.id }));
      } catch (error) {
        logDraft('discard failed to remove local draft', {
          error: String(error),
        });
        handleNoteError(error);
        return false;
      }

      try {
        updateNoteCacheFields({
          dispatch,
          layoutIds: note.layoutId ? [note.layoutId] : [],
          noteId: note.id,
          updates: {
            draft: '',
          },
        });
      } catch (error) {
        logDraft('discard failed to clear draft caches', {
          error: String(error),
        });
        handleNoteError(error);
        return false;
      }

      if (onNoteUpdated) {
        onNoteUpdated({
          ...note,
          draft: '',
        });
      }

      logDraft('discard completed');
    } catch (error) {
      logDraft('discard failed unexpectedly', {
        error: String(error),
      });
      handleNoteError(error);
      return false;
    }
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
    handleNoteError,
  ]);

  return {
    isLoading,
    handleSave,
    handleDiscard,
  } as const;
};
