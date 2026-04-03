interface UseCollaborativeContentProps {
  enableCollaboration: boolean;
  isEditing: boolean;
  noteId?: string;
  payload: string;
}

export const useCollaborativeContent = ({
  enableCollaboration,
  isEditing,
  payload,
}: UseCollaborativeContentProps) => {
  if (enableCollaboration && isEditing) {
    return payload;
  }

  return '';
};
