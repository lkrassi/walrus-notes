import type { Note } from '@/entities/note';
import type { DragEvent, MouseEvent } from 'react';
import { useCallback } from 'react';
import type { Node } from 'reactflow';

interface UseGraphSelectionHandlersProps {
  screenToFlowPosition: (point: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  handleAddNoteToGraph?: (
    note: Note,
    dropPosition: { x: number; y: number }
  ) => void;
}

export const useGraphSelectionHandlers = ({
  screenToFlowPosition,
  handleAddNoteToGraph,
}: UseGraphSelectionHandlersProps) => {
  const toFlowCoords = useCallback(
    (clientX: number, clientY: number) =>
      screenToFlowPosition({ x: clientX, y: clientY }),
    [screenToFlowPosition]
  );

  const handleNoteDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note = JSON.parse(noteData);
          const dropPosition = toFlowCoords(event.clientX, event.clientY);
          handleAddNoteToGraph?.(note, dropPosition);
        } catch (_error) {}
      }
    },
    [toFlowCoords, handleAddNoteToGraph]
  );

  const handleNodeDoubleClick = useCallback(
    (event: MouseEvent, _node?: Node | null) => {
      event.stopPropagation();
    },
    []
  );

  return {
    handleNoteDrop,
    handleNodeDoubleClick,
  };
};
