import { useCallback, useEffect } from 'react';
import type { Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface UseGraphSyncHandlersProps {
  nodes: Node[];
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  isDraggingEdge?: boolean;
}

export const useGraphSyncHandlers = ({
  nodes,
  onNoteOpen,
  isDraggingEdge,
}: UseGraphSyncHandlersProps) => {
  const handleNoteOpen = useCallback(
    (noteId: string) => {
      const node = nodes.find(n => n.id === noteId) as
        | Node<{ note?: Note; layoutColor?: string }>
        | undefined;
      const note = node ? (node.data as { note?: Note })?.note : undefined;
      if (note) {
        onNoteOpen?.({ noteId, note });
      }
    },
    [nodes, onNoteOpen]
  );

  useEffect(() => {
    return () => {};
  }, [isDraggingEdge]);

  return {
    handleNoteOpen,
  };
};
