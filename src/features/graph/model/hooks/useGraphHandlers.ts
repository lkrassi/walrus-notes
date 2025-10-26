import { useCallback } from 'react';
import type { NodeChange, NodeDragHandler, OnNodesChange } from 'reactflow';

interface UseGraphHandlersProps {
  updatePositionCallback: (noteId: string, xPos: number, yPos: number) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onNodesChange: (changes: NodeChange[]) => void;
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
    (note: any, dropPosition?: { x: number; y: number }) => {
      if (!dropPosition) {
        console.warn('No drop position provided for note:', note.id);
        return;
      }
      updatePositionCallback(note.id, dropPosition.x, dropPosition.y);
    },
    [updatePositionCallback]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
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
    (event: React.MouseEvent, node: any) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: any) => {
      onNodeMouseEnter(node.id);
    },
    [onNodeMouseEnter]
  );

  const handleNodeMouseLeave = useCallback(
    (event: React.MouseEvent, node: any) => {
      onNodeMouseLeave();
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
        } catch (error) {
          console.error('Failed to parse note data:', error);
        }
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
