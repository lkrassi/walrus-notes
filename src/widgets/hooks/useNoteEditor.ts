import { useUpdateNoteMutation } from 'app/store/api';
import { useEffect, useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useNotifications } from 'widgets';

export const useNoteEditor = (
  note: Note,
  onNoteUpdated?: (note: Note) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [payload, setPayload] = useState(note.payload);
  const { showError } = useNotifications();
  const [updateNote, { isLoading }] = useUpdateNoteMutation();

  useEffect(() => {
    setTitle(note.title);
    setPayload(note.payload);
  }, [note.title, note.payload]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setPayload(note.payload);
    setIsEditing(false);
    return true;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('notes:enterNoteTitle');
      return;
    }

    const newTitle = title.trim();
    const newPayload = payload.trim();

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

  return {
    isEditing,
    title,
    payload,
    isLoading,
    setTitle,
    setPayload,
    handleEdit,
    handleCancel,
    handleSave,
  };
};
