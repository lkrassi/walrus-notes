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
    const shouldInitContent = initialContentRef.current === '' && payload;

    console.log('[Collab Content] Проверка обновления:', {
      noteId,
      noteIdChanged,
      editingStateChanged,
      shouldInitContent,
      payloadLength: payload?.length || 0,
      currentInitialContentLength: initialContentRef.current.length,
    });

    if (noteIdChanged || editingStateChanged || shouldInitContent) {
      console.log(
        '[Collab Content] Обновляем initialContent, новая длина:',
        payload?.length || 0
      );
      initialContentRef.current = payload;
      lastNoteIdRef.current = noteId;
    }
  }

  lastEditingStateRef.current = isEditing;

  return initialContentRef.current;
};
