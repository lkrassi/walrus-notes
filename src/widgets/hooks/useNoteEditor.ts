import { useUpdateNoteMutation } from 'app/store/api';
import { removeDraft, setDraft } from 'app/store/slices/draftsSlice';
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
  let initialPayload = note.payload ?? '';
  if (storeDraft && storeDraft.length) {
    initialPayload = storeDraft;
  } else if (note.draft && note.draft.length) {
    initialPayload = note.draft;
  }

  const [payload, setPayloadState] = useState<string>(initialPayload);
  const { showError } = useNotifications();
  const [updateNote, { isLoading }] = useUpdateNoteMutation();
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

  const originalPayloadRef = useRef<string>(note.payload ?? '');
  const lastLocalCommitRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();

  const setPayload = (value: string) => {
    try {
      setPayloadState(value);
      if (value != null && value !== originalPayloadRef.current) {
        dispatch(setDraft({ noteId: note.id, text: value }));
      } else {
        dispatch(removeDraft({ noteId: note.id }));
      }
    } catch (_e) {}
  };

  useEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      note.draft && note.draft.length ? note.draft : note.payload;
    setPayloadState(prev => {
      const incomingSafe = incoming ?? '';
      if (storeDraft && storeDraft.length) {
        return storeDraft;
      }
      try {
        if (
          lastLocalCommitRef.current != null &&
          Date.now() - lastLocalCommitRef.current < 5000 &&
          incomingSafe !== originalPayloadRef.current
        ) {
          return prev;
        }
      } catch (_e) {}
      if (prev === originalPayloadRef.current) return incomingSafe;
      return prev;
    });
    originalPayloadRef.current = note.payload ?? '';
  }, [note.id, note.title, note.payload, note.draft]);

  useEffect(() => {
    try {
      if (storeDraft && storeDraft.length) {
        setPayloadState(storeDraft);
      }
    } catch (_e) {}
  }, [storeDraft, note.id]);

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
    const newPayload = safePayload.trim();

    if (newTitle === note.title && newPayload === note.payload) {
      setIsEditing(false);
      return true;
    }

    try {
      await updateNote({
        noteId: note.id,
        payload: newPayload,
        title: newTitle,
      }).unwrap();

      try {
        const res = commitDraft(newPayload);
        try {
          if (res) lastLocalCommitRef.current = Date.now();
        } catch (_e) {}
      } catch (_e) {}
      try {
        setPayloadState(newPayload);
        originalPayloadRef.current = newPayload;
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
    } catch {
      showError('notes:noteUpdateError');
      return false;
    }
  };

  const handleDiscard = async () => {
    try {
      setPayload(originalPayloadRef.current);
      try {
        sendUpdateDraft('');
      } catch (_e) {}
      try {
        dispatch(removeDraft({ noteId: note.id }));
      } catch (_e) {}
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
    hasLocalChanges: payload !== originalPayloadRef.current,
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
