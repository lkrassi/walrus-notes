import type { Note } from '@/entities/note';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback, useRef, useState } from 'react';

interface UseGraphDragAndDropProps {
  onAddNoteToGraph?: (note: Note, position?: { x: number; y: number }) => void;
  screenToFlowPosition?: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  centerCoords: { x: number; y: number } | null;
}

type DragCardSize = {
  width: number;
  height: number;
};

const DEBUG_GRAPH_DND = true;

export const useGraphDragAndDrop = ({
  onAddNoteToGraph,
  screenToFlowPosition,
  centerCoords,
}: UseGraphDragAndDropProps) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const [activeDragNote, setActiveDragNote] = useState<Note | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragSize, setActiveDragSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [lastClientCoords, setLastClientCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const resolveNoteFromDragData = useCallback((data: unknown): Note | null => {
    if (!data || typeof data !== 'object') return null;

    const candidate = data as Partial<Note> & { note?: Partial<Note> };
    if (typeof candidate.id === 'string') {
      return candidate as Note;
    }

    if (candidate.note && typeof candidate.note.id === 'string') {
      return candidate.note as Note;
    }

    return null;
  }, []);

  const resolveDragSizeFromData = useCallback(
    (data: unknown): DragCardSize | null => {
      if (!data || typeof data !== 'object') return null;

      const candidate = data as Partial<Note> & {
        note?: Partial<Note>;
        dragSize?: Partial<DragCardSize>;
      };

      const size = candidate.dragSize;
      if (
        size &&
        typeof size.width === 'number' &&
        typeof size.height === 'number' &&
        size.width > 0 &&
        size.height > 0
      ) {
        return { width: size.width, height: size.height };
      }

      return null;
    },
    []
  );

  const handleDndDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveDragId(event.active.id.toString());

      const note = resolveNoteFromDragData(event.active.data.current);
      if (note) {
        setActiveDragNote(note);
      }

      const initialRect = event.active.rect.current.initial;
      if (initialRect && initialRect.width > 0 && initialRect.height > 0) {
        setActiveDragSize({
          width: initialRect.width,
          height: initialRect.height,
        });
      } else {
        setActiveDragSize(resolveDragSizeFromData(event.active.data.current));
      }

      if (DEBUG_GRAPH_DND) {
        console.log('[graph-dnd] start', {
          activeId: event.active.id.toString(),
          noteId: note?.id,
          initialRect,
          dragSize: resolveDragSizeFromData(event.active.data.current),
        });
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
    },
    [resolveNoteFromDragData, resolveDragSizeFromData]
  );

  const handleDndDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const id = active.id.toString();
      const overId = over?.id?.toString() ?? null;
      const isDroppedBackToUnposed =
        overId === 'unposed-panel-drop' ||
        overId === 'unposed-grid-drop' ||
        overId?.startsWith('unposed-');
      const isDroppedToGraph = !!overId && !isDroppedBackToUnposed;

      if (DEBUG_GRAPH_DND) {
        console.log('[graph-dnd] end', {
          activeId: id,
          overId,
          lastClientCoords,
          isDroppedBackToUnposed,
          isDroppedToGraph,
        });
      }

      if (id.startsWith('unposed-') && isDroppedToGraph) {
        const noteFromPayload = resolveNoteFromDragData(active.data.current);
        const fallbackNoteId = id.replace('unposed-', '');
        const note =
          noteFromPayload ??
          (fallbackNoteId ? ({ id: fallbackNoteId } as Note) : null);
        if (note) {
          let dropPosition = centerCoords || { x: 0, y: 0 };
          const client = lastClientCoords;
          if (client && typeof screenToFlowPosition === 'function') {
            try {
              dropPosition = screenToFlowPosition(client);
            } catch (_e) {}
          }

          if (DEBUG_GRAPH_DND) {
            console.log('[graph-dnd] add-to-graph', {
              noteId: note.id,
              noteFromPayload: !!noteFromPayload,
              dropPosition,
            });
          }

          onAddNoteToGraph?.(note, dropPosition);
        }
      }

      setActiveDragNote(null);
      setActiveDragId(null);
      setActiveDragSize(null);
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      } catch (_e) {}
      setLastClientCoords(null);
    },
    [
      onAddNoteToGraph,
      centerCoords,
      lastClientCoords,
      screenToFlowPosition,
      resolveNoteFromDragData,
      resolveDragSizeFromData,
    ]
  );

  return {
    activeDragNote,
    activeDragId,
    activeDragSize,
    handleDndDragStart,
    handleDndDragEnd,
  };
};
