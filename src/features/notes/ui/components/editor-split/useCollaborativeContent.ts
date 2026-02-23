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

  if (enableCollaboration && isEditing && noteId) {
    const noteIdChanged = lastNoteIdRef.current !== noteId;
    const shouldInitContent = initialContentRef.current === '' && payload;

    if (noteIdChanged || shouldInitContent) {
      initialContentRef.current = payload;
      lastNoteIdRef.current = noteId;
    }
  }

  return initialContentRef.current;
};
