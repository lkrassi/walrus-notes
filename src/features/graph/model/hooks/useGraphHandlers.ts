import { useCallback } from 'react';
import type { Node, NodeChange, OnNodesChange } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface UseGraphHandlersProps {
  updatePositionCallback: (
    nodeId: string,
    xPos: number,
    yPos: number
  ) => Promise<void>;
  onNodeClick: (nodeId: string) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: (nodeId?: string) => void;
  onNodesChange: OnNodesChange;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
}

export const useGraphHandlers = ({
  updatePositionCallback,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onNodesChange,
  screenToFlowPosition,
}: UseGraphHandlersProps) => {
  const handleAddNoteToGraph = useCallback(
    (note: Note, dropPosition?: { x: number; y: number }) => {
      if (!dropPosition) {
        return;
      }
      updatePositionCallback(note.id, dropPosition.x, dropPosition.y);
    },
    [updatePositionCallback]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node?: Node | null) => {
      if (!node) return;
      updatePositionCallback(node.id, node.position.x, node.position.y);
    },
    [updatePositionCallback]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node?: Node | null) => {
      if (!node?.id) return;
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node?: Node | null) => {
      if (!node?.id) return;
      onNodeMouseEnter(node.id);
    },
    [onNodeMouseEnter]
  );

  const handleNodeMouseLeave = useCallback(
    (_event: React.MouseEvent, node?: Node | null) => {
      onNodeMouseLeave(node?.id);
    },
    [onNodeMouseLeave]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note = JSON.parse(noteData);
          const dropPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          handleAddNoteToGraph(note, dropPosition);
        } catch (_error) {}
      }
    },
    [handleAddNoteToGraph, screenToFlowPosition]
  );

  return {
    handleAddNoteToGraph,
    onNodeDragStop,
    handleNodesChange,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    onDrop,
  };
};
