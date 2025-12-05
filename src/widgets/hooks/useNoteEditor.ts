import { useUpdateNoteMutation } from 'app/store/api';
import { useEffect, useRef, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useNotifications } from 'widgets';
import useDraftSync from 'features/notes/model/useDraftSync';
import { useAppSelector } from './redux';
import { useAppDispatch } from './redux';
import { removeDraft, setDraft } from 'app/store/slices/draftsSlice';

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
  const userId =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('userId') || ''
      : '';

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
  const dispatch = useAppDispatch();

  const setPayload = (value: string) => {
    try {
      setPayloadState(value);
      const lsKey = `wn.draft.${note.id}`;
      if (value != null && value !== originalPayloadRef.current) {
        dispatch(setDraft({ noteId: note.id, text: value }));
        try {
          localStorage.setItem(lsKey, value);
        } catch (_e) {}
      } else {
        dispatch(removeDraft({ noteId: note.id }));
        try {
          localStorage.removeItem(lsKey);
        } catch (_e) {}
      }
    } catch (_e) {}
  };

  useEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      note.draft && note.draft.length ? note.draft : note.payload;
    const lsKey = `wn.draft.${note.id}`;
    let lsDraft: string | null = null;
    try {
      lsDraft = localStorage.getItem(lsKey);
    } catch (_e) {
      lsDraft = null;
    }

    setPayloadState(prev => {
      const incomingSafe = incoming ?? '';
      if (storeDraft && storeDraft.length) {
        return storeDraft;
      }
      if (lsDraft && lsDraft.length) {
        return lsDraft;
      }
      if (prev === originalPayloadRef.current) return incomingSafe;
      return prev;
    });
    originalPayloadRef.current = note.payload ?? '';
  }, [note.title, note.payload, note.draft]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setIsEditing(false);
    return true;
  };

  const handleSave = async () => {
    const safeTitle = title ?? '';
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

      setIsEditing(false);
      onNoteUpdated?.(updatedNote);

      try {
        commitDraft();
      } catch (_e) {}

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
      try {
        localStorage.removeItem(`wn.draft.${note.id}`);
      } catch (_e) {}
    } catch (_e) {}
    try {
      localStorage.removeItem(`wn.draft.${note.id}`);
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
