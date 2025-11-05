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
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('notes:enterNoteTitle');
      return;
    }

    try {
      await updateNote({
        noteId: note.id,
        payload: payload.trim(),
        title: title.trim(),
      }).unwrap();

      const updatedNote: Note = {
        ...note,
        title: title.trim(),
        payload: payload.trim(),
        updatedAt: new Date().toISOString(),
      };

      onNoteUpdated?.(updatedNote);
      setIsEditing(false);
    } catch {
      showError('notes:noteUpdateError');
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
