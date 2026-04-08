import { useDroppable } from '@dnd-kit/core';
import { useRef, type DragEvent, type FC, type ReactNode } from 'react';

interface GraphDropZoneProps {
  onDrop: (event: DragEvent) => void;
  children: ReactNode;
  isDraggingEdge?: boolean;
  activeDragNote?: unknown | null;
  lastDndDropAt?: number | null;
}

export const GraphDropZone: FC<GraphDropZoneProps> = ({
  onDrop,
  children,
  isDraggingEdge: _isDraggingEdge = false,
  activeDragNote = null,
  lastDndDropAt = null,
}) => {
  const { setNodeRef } = useDroppable({
    id: 'graph-drop-zone',
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={node => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      className={`bg-surface-2 ring-ring relative flex-1 cursor-no-drop ring-2`}
      onDrop={e => {
        const now = Date.now();
        if (activeDragNote) return;
        if (lastDndDropAt && now - lastDndDropAt < 500) return;
        onDrop(e as unknown as DragEvent);
      }}
      onDragOver={e => {
        e.preventDefault();
      }}
    >
      {children}
    </div>
  );
};
