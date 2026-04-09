import { useDeleteNoteMutation } from '@/entities/note';
import { useTabs } from '@/entities/tab';
import { useCallback } from 'react';

export const useDeleteNoteFlow = () => {
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();
  const { closeByItem } = useTabs();

  const removeNote = useCallback(
    async (noteId: string) => {
      await deleteNote({ noteId }).unwrap();
      closeByItem(noteId, 'note');
    },
    [closeByItem, deleteNote]
  );

  return {
    removeNote,
    isLoading,
  } as const;
};
