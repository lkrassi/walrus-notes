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
  const [isEditing, setIsEditing] = useState(() => {
    if (!canWrite) {
      return false;
    }

    const initialHasDraft = !!note.draft?.trim();
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

  const hasServerDraft = !!serverDraft.length;
  const storedDraftText = storeDraft?.trim() ?? '';
  const hasStoreDraft = !!storedDraftText.length && hasServerDraft;

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
      setIsEditing(true);
    }
  }, [canWrite, hasServerDraft, hasStoreDraft, note.id]);

  useEffect(() => {
    ignoreDraftRef.current = false;
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
    if (!canWrite) {
      setIsEditing(false);
      return false;
    }
    const safeTitle =
      overrideTitle !== undefined ? overrideTitle : (title ?? '');
    const safePayload = payload ?? '';

    if (!safeTitle.trim()) {
      showError('notes:enterNoteTitle');
      return;
    }

    const newTitle = safeTitle.trim();
    const newPayload = safePayload;

    if (newTitle === note.title && newPayload === note.payload) {
      setIsEditing(false);
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
      } catch (_e) {}
      try {
        setPayloadState(finalPayload);
      } catch (_e) {}

      const updatedNote: Note = {
        ...note,
        ...serverNote,
        title: finalTitle,
        payload: finalPayload,
        updatedAt: finalUpdatedAt,
      };

      setTitle(finalTitle);
      setIsEditing(false);
      onNoteUpdated?.(updatedNote);

      return true;
    } catch (error) {
      if (isRecordNotFound422(error)) {
        return false;
      }

      showError('notes:noteUpdateError');
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
