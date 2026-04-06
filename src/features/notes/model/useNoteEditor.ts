import {
  addNotification,
  notesApi,
  removeDraft,
  useUpdateNoteMutation,
} from '@/entities';
import type { Note } from '@/entities/note';
import { i18n } from '@/shared/config/i18n';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDraftSync } from './useDraftSync';

type RootStateLike = {
  drafts?: Record<string, string>;
  user: {
    profile?: {
      id?: string;
    } | null;
  };
};

type DispatchLike = (action: unknown) => unknown;

export const useNoteEditor = (
  note: Note,
  canWrite: boolean,
  onNoteUpdated?: (note: Note) => void
) => {
  const isDraftDebug = import.meta.env.DEV;
  const logDraft = (message: string, extra?: Record<string, unknown>) => {
    if (!isDraftDebug) return;
    if (extra) {
      console.log(`[draft-flow][${note.id}] ${message}`, extra);
      return;
    }
    console.log(`[draft-flow][${note.id}] ${message}`);
  };

  const [isEditing, setIsEditing] = useState(() => {
    if (!canWrite) {
      return false;
    }

    const initialServerDraft = note.draft?.trim() ?? '';
    const initialHasDraft =
      !!initialServerDraft.length &&
      initialServerDraft !== (note.payload ?? '');
    return initialHasDraft;
  });
  const [title, setTitle] = useState<string>(note.title ?? '');
  const dispatch = useDispatch() as DispatchLike;

  const storeDraft = useSelector(
    (s: RootStateLike) => s.drafts?.[note.id] ?? null
  );
  const userId = useSelector((s: RootStateLike) => s.user.profile?.id ?? '');

  const originalPayload = note.payload ?? '';
  const ignoreDraftRef = useRef(false);
  const serverDraft = note.draft?.trim() ?? '';

  const hasServerDraft =
    !!serverDraft.length && serverDraft !== (note.payload ?? '');
  const storedDraftText = storeDraft?.trim() ?? '';
  const hasStoreDraft =
    !!storedDraftText.length && storedDraftText !== (note.payload ?? '');
  const hasAnyDraftMarker = !!storedDraftText.length || !!serverDraft.length;

  let initialPayload = originalPayload;
  if (!ignoreDraftRef.current) {
    if (hasStoreDraft) {
      initialPayload = storedDraftText;
    } else if (hasServerDraft) {
      initialPayload = serverDraft;
    }
  }

  const [payload, setPayloadState] = useState<string>(initialPayload);
  const [updateNote, { isLoading }] = useUpdateNoteMutation();

  const {
    commitDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    sendUpdateDraft,
  } = useDraftSync({
    noteId: note.id,
    userId,
    draft: payload,
  });

  const lastLocalCommitRef = useRef<number | null>(null);
  const lastLocalUpdateRef = useRef<number | null>(null);
  const hydratedServerPayloadRef = useRef<string>(note.payload ?? '');

  const setPayload = (value: string | ((prev: string) => string)) => {
    try {
      lastLocalUpdateRef.current = Date.now();
      setPayloadState(prev => {
        const newValue = typeof value === 'function' ? value(prev) : value;
        return newValue;
      });
    } catch (_e) {}
  };

  useLayoutEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      !ignoreDraftRef.current && hasStoreDraft
        ? storedDraftText
        : !ignoreDraftRef.current && hasServerDraft
          ? serverDraft
          : note.payload;
    setPayloadState(prev => {
      const incomingSafe = incoming ?? '';
      hydratedServerPayloadRef.current = incomingSafe;
      try {
        if (
          lastLocalCommitRef.current != null &&
          Date.now() - lastLocalCommitRef.current < 5000 &&
          incomingSafe !== originalPayload
        ) {
          return prev;
        }
      } catch (_e) {}
      if (lastLocalUpdateRef.current == null) {
        return incomingSafe;
      }
      return prev;
    });

    logDraft('hydrate payload from note/store draft', {
      hasServerDraft,
      hasStoreDraft,
      notePayloadLength: (note.payload ?? '').length,
      noteDraftLength: (note.draft ?? '').length,
      storeDraftLength: (storeDraft ?? '').length,
    });
  }, [
    hasServerDraft,
    hasStoreDraft,
    note.id,
    note.title,
    note.payload,
    serverDraft,
    storeDraft,
  ]);

  useLayoutEffect(() => {
    try {
      if (!ignoreDraftRef.current && hasStoreDraft) {
        if (
          lastLocalUpdateRef.current != null &&
          Date.now() - lastLocalUpdateRef.current < 2000
        ) {
          return;
        }
        setPayloadState(storedDraftText);
      }
    } catch (_e) {}
  }, [hasStoreDraft, note.id, storedDraftText]);

  useLayoutEffect(() => {
    if (!canWrite) {
      return;
    }

    if (hasStoreDraft || hasServerDraft) {
      logDraft('force edit mode because draft detected', {
        hasStoreDraft,
        hasServerDraft,
        notePayloadLength: (note.payload ?? '').length,
        noteDraftLength: (note.draft ?? '').length,
        storeDraftLength: (storeDraft ?? '').length,
      });
      setIsEditing(true);
    }
  }, [canWrite, hasServerDraft, hasStoreDraft, note.id]);

  useEffect(() => {
    ignoreDraftRef.current = false;
    logDraft('note context switched, reset ignoreDraftRef', {
      notePayloadLength: (note.payload ?? '').length,
      noteDraftLength: (note.draft ?? '').length,
      storeDraftLength: (storeDraft ?? '').length,
    });
  }, [note.id]);

  const isRecordNotFound422 = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;

    const maybeError = error as {
      status?: number | string;
      data?: {
        meta?: {
          code?: string;
        };
      };
    };

    const rawStatus = maybeError.status;
    const status =
      typeof rawStatus === 'string' ? Number(rawStatus) : rawStatus;
    const code = maybeError.data?.meta?.code;

    return status === 422 && code === 'record_not_found';
  };

  const showError = (message: string) => {
    const translatedMessage = message.includes(':') ? i18n.t(message) : message;

    dispatch(
      addNotification({
        type: 'error',
        message: translatedMessage,
        duration: 7000,
        origin: 'ui',
      })
    );
  };

  const handleEdit = () => {
    if (!canWrite) return;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title ?? '');
    setIsEditing(false);
    return true;
  };

  const handleSave = async (overrideTitle?: string) => {
    logDraft('save clicked', {
      canWrite,
      currentIsEditing: isEditing,
      notePayloadLength: (note.payload ?? '').length,
      noteDraftLength: (note.draft ?? '').length,
      storeDraftLength: (storeDraft ?? '').length,
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
      return;
    }

    const newTitle = safeTitle.trim();
    const newPayload = safePayload;

    if (newTitle === note.title && newPayload === note.payload) {
      // If note arrived with draft marker but content is unchanged, we still
      // need to commit draft cleanup; otherwise it will reopen in edit mode.
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
          const targetLayoutId = note.layoutId;
          if (targetLayoutId) {
            dispatch(
              notesApi.util.updateQueryData(
                'getNotes',
                { layoutId: targetLayoutId, page: 1 },
                draftState => {
                  const idx = draftState.data.findIndex(n => n.id === note.id);
                  if (idx !== -1) {
                    draftState.data[idx].draft = '';
                  }
                }
              )
            );

            dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId: targetLayoutId },
                draftState => {
                  const idx = draftState.data.findIndex(n => n.id === note.id);
                  if (idx !== -1) {
                    draftState.data[idx].draft = '';
                  }
                }
              )
            );

            dispatch(
              notesApi.util.updateQueryData(
                'getUnposedNotes',
                { layoutId: targetLayoutId },
                draftState => {
                  const idx = draftState.data.findIndex(n => n.id === note.id);
                  if (idx !== -1) {
                    draftState.data[idx].draft = '';
                  }
                }
              )
            );
          }
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
      const finalUpdatedAt = serverNote?.updatedAt ?? new Date().toISOString();

      try {
        const res = commitDraft(finalPayload);
        try {
          if (res) {
            lastLocalCommitRef.current = Date.now();
          }
        } catch (_e) {}

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
        const targetLayoutId = note.layoutId || serverNote?.layoutId;
        if (targetLayoutId) {
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: targetLayoutId, page: 1 },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].title = finalTitle;
                  draftState.data[idx].payload = finalPayload;
                  draftState.data[idx].draft = '';
                }
              }
            )
          );

          dispatch(
            notesApi.util.updateQueryData(
              'getPosedNotes',
              { layoutId: targetLayoutId },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].title = finalTitle;
                  draftState.data[idx].payload = finalPayload;
                  draftState.data[idx].draft = '';
                }
              }
            )
          );

          dispatch(
            notesApi.util.updateQueryData(
              'getUnposedNotes',
              { layoutId: targetLayoutId },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].title = finalTitle;
                  draftState.data[idx].payload = finalPayload;
                  draftState.data[idx].draft = '';
                }
              }
            )
          );
        }
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
  };

  const handleDiscard = async () => {
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
        if (note.layoutId) {
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: note.layoutId, page: 1 },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].draft = '';
                }
              }
            )
          );

          dispatch(
            notesApi.util.updateQueryData(
              'getPosedNotes',
              { layoutId: note.layoutId },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].draft = '';
                }
              }
            )
          );

          dispatch(
            notesApi.util.updateQueryData(
              'getUnposedNotes',
              { layoutId: note.layoutId },
              draftState => {
                const idx = draftState.data.findIndex(n => n.id === note.id);
                if (idx !== -1) {
                  draftState.data[idx].draft = '';
                }
              }
            )
          );
        }
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
  };

  return {
    isEditing,
    title,
    payload,
    isLoading,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    hasLocalChanges:
      lastLocalUpdateRef.current != null &&
      payload !== hydratedServerPayloadRef.current,
    hasServerDraft: !!(
      note.draft &&
      note.draft.length &&
      note.draft !== note.payload
    ),
    setTitle,
    setPayload,
    handleEdit,
    handleCancel,
    handleSave,
    handleDiscard,
    sendUpdateDraft,
  };
};
