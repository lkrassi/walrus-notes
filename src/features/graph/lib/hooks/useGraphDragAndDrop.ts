import type { Note } from '@/entities/note';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback, useRef, useState } from 'react';

interface UseGraphDragAndDropProps {
  onAddNoteToGraph: (note: Note, position?: { x: number; y: number }) => void;
  screenToFlowPosition?: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  centerCoords: { x: number; y: number } | null;
}

export const useGraphDragAndDrop = ({
  onAddNoteToGraph,
  screenToFlowPosition,
  centerCoords,
}: UseGraphDragAndDropProps) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const [activeDragNote, setActiveDragNote] = useState<Note | null>(null);
  const [lastClientCoords, setLastClientCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleDndDragStart = useCallback((event: DragStartEvent) => {
    const note = event.active.data.current as Note | undefined;
    if (note) {
      setActiveDragNote(note);
    }
    const handlePointer = (e: PointerEvent) => {
      setLastClientCoords({ x: e.clientX, y: e.clientY });
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches && e.touches[0];
      if (t) setLastClientCoords({ x: t.clientX, y: t.clientY });
    };
    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('touchmove', handleTouch);
    cleanupRef.current = () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const handleDndDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const id = active.id.toString();

      if (id.startsWith('unposed-') && over?.id === 'graph-drop-zone') {
        const note = active.data.current as Note | undefined;
        if (note) {
          let dropPosition = centerCoords || { x: 0, y: 0 };
          const client = lastClientCoords;
          if (client && typeof screenToFlowPosition === 'function') {
            try {
              dropPosition = screenToFlowPosition(client);
            } catch (_e) {}
          }
          onAddNoteToGraph(note, dropPosition);
        }
      }

      setActiveDragNote(null);
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      } catch (_e) {}
      setLastClientCoords(null);
    },
    [onAddNoteToGraph, centerCoords, lastClientCoords, screenToFlowPosition]
  );

  return {
    activeDragNote,
    handleDndDragStart,
    handleDndDragEnd,
  };
};
