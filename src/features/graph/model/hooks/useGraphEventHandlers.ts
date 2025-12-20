import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import type { Node } from 'reactflow';
import type { Note } from 'shared/model';

interface UseGraphEventHandlersProps {
  handleAddNoteToGraph: (
    note: Note,
    position: { x: number; y: number }
  ) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
}

export const useGraphEventHandlers = ({
  handleAddNoteToGraph,
  screenToFlowPosition,
}: UseGraphEventHandlersProps) => {
  const handleNoteDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note: Note = JSON.parse(noteData);
          const dropPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          handleAddNoteToGraph(note, dropPosition);
        } catch (_error) {
        }
      }
    },
    [handleAddNoteToGraph, screenToFlowPosition]
  );

  const handleNodeDoubleClick = useCallback((event: MouseEvent, node: Node) => {
    event.stopPropagation();
    node.data?.onNoteClick?.(node.id);
  }, []);

  return {
    handleNoteDrop,
    handleNodeDoubleClick,
  };
};
