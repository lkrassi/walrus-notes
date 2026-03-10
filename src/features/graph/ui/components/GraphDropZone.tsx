import { useDroppable } from '@dnd-kit/core';
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FC,
  type MouseEvent,
  type ReactNode,
} from 'react';

interface GraphDropZoneProps {
  onDrop: (event: DragEvent) => void;
  children: ReactNode;
  isDraggingEdge?: boolean;
  onBoxSelect?: (rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
}

export const GraphDropZone: FC<GraphDropZoneProps> = ({
  onDrop,
  children,
  isDraggingEdge = false,
  onBoxSelect,
}) => {
  const { setNodeRef } = useDroppable({
    id: 'graph-drop-zone',
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0 || !e.ctrlKey) return;
    e.preventDefault();
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    setCurrent({ x: e.clientX, y: e.clientY });
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setCurrent({ x: e.clientX, y: e.clientY });
    },
    [dragging]
  );

  const finish = useCallback(() => {
    if (!dragging || !start || !current) {
      setDragging(false);
      setStart(null);
      setCurrent(null);
      return;
    }

    const x1 = Math.min(start.x, current.x);
    const x2 = Math.max(start.x, current.x);
    const y1 = Math.min(start.y, current.y);
    const y2 = Math.max(start.y, current.y);

    onBoxSelect?.({ x1, y1, x2, y2 });

    setDragging(false);
    setStart(null);
    setCurrent(null);
  }, [dragging, start, current, onBoxSelect]);

  const onContextMenu = useCallback(
    (e: MouseEvent) => {
      if (dragging) e.preventDefault();
    },
    [dragging]
  );

  const rectStyle = (() => {
    if (!start || !current) return undefined;
    const left = Math.min(start.x, current.x);
    const top = Math.min(start.y, current.y);
    const width = Math.abs(start.x - current.x);
    const height = Math.abs(start.y - current.y);
    return {
      left,
      top,
      width,
      height,
    } as CSSProperties;
  })();

  return (
    <div
      ref={node => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      className={`relative flex-1 ${
        isDraggingEdge ? 'bg-surface-2 ring-ring cursor-no-drop ring-2' : ''
      } transition-all duration-200`}
      onDrop={e => {
        onDrop(e as unknown as DragEvent);
      }}
      onDragOver={e => {
        e.preventDefault();
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={finish}
      onMouseLeave={finish}
      onContextMenu={onContextMenu}
    >
      {children}

      {rectStyle && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            border: '1px solid var(--primary)',
            background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
            left: rectStyle.left,
            top: rectStyle.top,
            width: rectStyle.width,
            height: rectStyle.height,
          }}
        />
      )}
    </div>
  );
};
