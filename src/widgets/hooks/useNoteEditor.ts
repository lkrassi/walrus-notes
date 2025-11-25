import { useUpdateNoteMutation } from 'app/store/api';
import { useEffect, useRef, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useNotifications } from 'widgets';
import useDraftSync from 'features/notes/model/useDraftSync';
import { useAppSelector } from './redux';
import { useAppDispatch } from './redux';
import { removeDraft } from 'app/store/slices/draftsSlice';

export const useNoteEditor = (
  note: Note,
  onNoteUpdated?: (note: Note) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState<string>(note.title ?? '');
  // prefer pending draft from store, then server draft, then note payload
  const storeDraft = useAppSelector(s => s.drafts?.[note.id] ?? null);
  let initialPayload = note.payload ?? '';
  if (storeDraft && storeDraft.length) {
    initialPayload = storeDraft;
    try {
      console.debug('[useNoteEditor] using cached payload from store', {
        noteId: note.id,
        len: storeDraft.length,
      });
    } catch (_e) {}
  } else if (note.draft && note.draft.length) {
    initialPayload = note.draft;
    try {
      console.debug('[useNoteEditor] using server draft on init', {
        noteId: note.id,
        len: note.draft.length,
      });
    } catch (_e) {}
  }

  const [payload, setPayload] = useState<string>(initialPayload);
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

  useEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      note.draft && note.draft.length ? note.draft : note.payload;
    setPayload(prev => {
      const incomingSafe = incoming ?? '';
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
    try {
      // NOTE: do not change `payload` on cancel — preserve user's in-progress draft
      // so it can be restored when the note is opened again.
    } catch (_e) {}
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

    // If nothing changed, close editor without making API call
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
        // inform other clients / server to commit draft
        const cres = commitDraft();
        try {
          console.debug('[useNoteEditor] commitDraft invoked', {
            noteId: note.id,
            res: cres,
          });
        } catch (_e) {}
      } catch (_e) {}

      // ensure local editor state reflects the saved payload immediately
      try {
        setPayload(newPayload);
        // mark the originalPayloadRef so incoming server props won't overwrite
        originalPayloadRef.current = newPayload;
      } catch (_e) {}

      const updatedNote: Note = {
        ...note,
        title: newTitle,
        payload: newPayload,
        updatedAt: new Date().toISOString(),
      };

      // close editor first to allow exit animation to run cleanly,
      // then inform parent about the updated note (prevents parent
      // re-render while editor is still mounted which caused double animations)
      setIsEditing(false);
      onNoteUpdated?.(updatedNote);
      return true;
    } catch {
      showError('notes:noteUpdateError');
      return false;
    }
  };

  const dispatch = useAppDispatch();

  const handleDiscard = async () => {
    try {
      // revert local payload to original server payload
      setPayload(originalPayloadRef.current);
      // send empty draft to notify server and clear remote draft
      try {
        await sendUpdateDraft('');
      } catch (_e) {}
      // clear pending draft in local store immediately
      try {
        dispatch(removeDraft({ noteId: note.id }));
      } catch (_e) {}
    } catch (_e) {}
    // close editor
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
