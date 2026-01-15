import { useCallback } from 'react';
import type { Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface UseGraphSelectionHandlersProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  lastBoxSelectedIdsRef: React.MutableRefObject<Set<string>>;
  screenToFlowPosition: (point: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  handleAddNoteToGraph?: (
    note: Note,
    dropPosition: { x: number; y: number }
  ) => void;
}

/**
 * Управляет всеми операциями выбора elements в графе.
 *
 * Обрабатывает:
 * - handleNoteDrop: Drop note на граф для добавления
 * - handleBoxSelect: Выбор нескольких nodes в прямоугольнике
 * - handleNodeDoubleClick: Double click для открытия заметки
 *
 * Box select использует координаты viewport и трансформирует их в flow coordinates
 */
export const useGraphSelectionHandlers = ({
  nodes,
  setNodes,
  lastBoxSelectedIdsRef,
  screenToFlowPosition,
  handleAddNoteToGraph,
}: UseGraphSelectionHandlersProps) => {
  // Helper для трансформации координат из viewport в flow coordinates
  const toFlowCoords = useCallback(
    (clientX: number, clientY: number) => {
      try {
        const wrapper = document.querySelector(
          '.react-flow'
        ) as HTMLElement | null;
        const viewport = document.querySelector(
          '.react-flow__viewport'
        ) as HTMLElement | null;
        if (!wrapper || !viewport) {
          return screenToFlowPosition({ x: clientX, y: clientY });
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const style = window.getComputedStyle(viewport);
        const transform = style.transform || '';

        let scale = 1;
        let tx = 0;
        let ty = 0;

        if (transform && transform !== 'none') {
          const m = transform.match(/matrix\(([^)]+)\)/);
          if (m && m[1]) {
            const parts = m[1].split(',').map(s => parseFloat(s.trim()));
            if (parts.length >= 6) {
              scale = parts[0];
              tx = parts[4];
              ty = parts[5];
            }
          }
        }

        const localX = clientX - wrapperRect.left;
        const localY = clientY - wrapperRect.top;

        const flowX = (localX - tx) / scale;
        const flowY = (localY - ty) / scale;

        return { x: flowX, y: flowY };
      } catch (_e) {
        return screenToFlowPosition({ x: clientX, y: clientY });
      }
    },
    [screenToFlowPosition]
  );

  // Drop note для добавления на граф
  const handleNoteDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note = JSON.parse(noteData);
          const dropPosition = toFlowCoords(event.clientX, event.clientY);
          handleAddNoteToGraph?.(note, dropPosition);
        } catch (_error) {
          // ignore
        }
      }
    },
    [toFlowCoords, handleAddNoteToGraph]
  );

  // Box select несколько nodes
  const handleBoxSelect = useCallback(
    (rect: { x1: number; y1: number; x2: number; y2: number }) => {
      try {
        const topLeft = toFlowCoords(rect.x1, rect.y1);
        const bottomRight = toFlowCoords(rect.x2, rect.y2);

        const fx1 = Math.min(topLeft.x, bottomRight.x);
        const fx2 = Math.max(topLeft.x, bottomRight.x);
        const fy1 = Math.min(topLeft.y, bottomRight.y);
        const fy2 = Math.max(topLeft.y, bottomRight.y);

        const nodesToSelect = nodes
          .filter(n => {
            const nx = n.position?.x ?? 0;
            const ny = n.position?.y ?? 0;
            const width = (n?.width as number) || 160;
            const height = (n?.height as number) || 80;
            const cx = nx + width / 2;
            const cy = ny + height / 2;
            return cx >= fx1 && cx <= fx2 && cy >= fy1 && cy <= fy2;
          })
          .map(n => n.id);

        if (nodesToSelect.length === 0) return;

        setNodes(prev => {
          const res = prev.map(n => ({
            ...n,
            selected: nodesToSelect.includes(n.id),
          }));
          lastBoxSelectedIdsRef.current = new Set(nodesToSelect);
          setTimeout(() => {
            setNodes(curr =>
              curr.map(n => ({ ...n, selected: nodesToSelect.includes(n.id) }))
            );
            setTimeout(() => lastBoxSelectedIdsRef.current.clear(), 300);
          }, 50);
          return res;
        });
      } catch (_e) {
        // ignore
      }
    },
    [nodes, toFlowCoords, setNodes, lastBoxSelectedIdsRef]
  );

  // Double click для открытия заметки
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node?: Node | null) => {
      event.stopPropagation();
      if (!node?.id) return;
      node.data?.onNoteClick?.(node.id);
    },
    []
  );

  return {
    handleNoteDrop,
    handleBoxSelect,
    handleNodeDoubleClick,
  };
};
