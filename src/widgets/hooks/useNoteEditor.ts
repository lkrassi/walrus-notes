import { useUpdateNoteMutation } from 'app/store/api';
import { removeDraft } from 'app/store/slices/draftsSlice';
import { useDraftSync } from 'features/notes/model/useDraftSync';
import { useEffect, useRef, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useNotifications } from 'widgets';
import { useAppDispatch, useAppSelector } from './redux';

export const useNoteEditor = (
  note: Note,
  onNoteUpdated?: (note: Note) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState<string>(note.title ?? '');
  const storeDraft = useAppSelector(s => s.drafts?.[note.id] ?? null);
  const originalPayload = note.payload ?? '';
  const ignoreDraftRef = useRef(false);

  let initialPayload = originalPayload;
  if (!ignoreDraftRef.current) {
    if (storeDraft && storeDraft.length) {
      initialPayload = storeDraft;
    } else if (note.draft && note.draft.length) {
      initialPayload = note.draft;
    }
  }

  const [payload, setPayloadState] = useState<string>(initialPayload);
  const { showError } = useNotifications();
  const [, { isLoading }] = useUpdateNoteMutation();
  const userId = useAppSelector(s => s.user.profile?.id ?? '');

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
  const dispatch = useAppDispatch();

  const setPayload = (value: string | ((prev: string) => string)) => {
    try {
      lastLocalUpdateRef.current = Date.now();
      setPayloadState(prev => {
        const newValue = typeof value === 'function' ? value(prev) : value;
        return newValue;
      });
    } catch (_e) {}
  };

  useEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      !ignoreDraftRef.current && storeDraft && storeDraft.length
        ? storeDraft
        : !ignoreDraftRef.current && note.draft && note.draft.length
          ? note.draft
          : note.payload;
    setPayloadState(prev => {
      const incomingSafe = incoming ?? '';
      try {
        if (
          lastLocalCommitRef.current != null &&
          Date.now() - lastLocalCommitRef.current < 5000 &&
          incomingSafe !== originalPayload
        ) {
          return prev;
        }
      } catch (_e) {}
      if (prev === originalPayload) {
        return incomingSafe;
      }
      return prev;
    });
  }, [note.id, note.title, note.payload, note.draft, storeDraft]);

  useEffect(() => {
    try {
      if (!ignoreDraftRef.current && storeDraft && storeDraft.length) {
        if (
          lastLocalUpdateRef.current != null &&
          Date.now() - lastLocalUpdateRef.current < 2000
        ) {
          return;
        }
        setPayloadState(storeDraft);
      }
    } catch (_e) {}
  }, [storeDraft, note.id]);

  useEffect(() => {
    ignoreDraftRef.current = false;
  }, [note.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title ?? '');
    setIsEditing(false);
    return true;
  };

  const handleSave = async (overrideTitle?: string) => {
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
      try {
        const res = commitDraft(newPayload);
        try {
          if (res) {
            lastLocalCommitRef.current = Date.now();
          }
        } catch (_e) {}
      } catch (_e) {}
      try {
        setPayloadState(newPayload);
        try {
          dispatch(removeDraft({ noteId: note.id }));
        } catch (_e) {}
      } catch (_e) {}

      const updatedNote: Note = {
        ...note,
        title: newTitle,
        payload: newPayload,
        updatedAt: new Date().toISOString(),
      };

      setTitle(newTitle);
      setIsEditing(false);
      onNoteUpdated?.(updatedNote);

      return true;
    } catch (_e) {
      showError('notes:noteUpdateError');
      return false;
    }
  };

  const handleDiscard = async () => {
    try {
      ignoreDraftRef.current = true;
      setPayload(originalPayload);
      try {
        sendUpdateDraft('');
      } catch (_e) {}
      try {
        dispatch(removeDraft({ noteId: note.id }));
      } catch (_e) {}

      if (onNoteUpdated) {
        onNoteUpdated({
          ...note,
          draft: '',
        });
      }
    } catch (_e) {}
    setIsEditing(false);
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
    hasLocalChanges: payload !== originalPayload,
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
