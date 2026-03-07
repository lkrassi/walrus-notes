import { useRef } from 'react';

interface UseCollaborativeContentProps {
  enableCollaboration: boolean;
  isEditing: boolean;
  noteId?: string;
  payload: string;
}

export const useCollaborativeContent = ({
  enableCollaboration,
  isEditing,
  noteId,
  payload,
}: UseCollaborativeContentProps) => {
  const initialContentRef = useRef<string>('');
  const lastNoteIdRef = useRef<string | undefined>(undefined);
  const lastEditingStateRef = useRef<boolean>(false);

  if (enableCollaboration && isEditing && noteId) {
    const noteIdChanged = lastNoteIdRef.current !== noteId;
    const editingStateChanged = !lastEditingStateRef.current && isEditing;

    if (noteIdChanged || editingStateChanged) {
      initialContentRef.current = payload;
      lastNoteIdRef.current = noteId;
    }
  }

  lastEditingStateRef.current = isEditing;

  return initialContentRef.current;
};
