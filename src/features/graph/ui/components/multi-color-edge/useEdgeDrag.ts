import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import type { EdgeDeleteEventDetail } from './types';

interface UseEdgeDragProps {
  id: string;
  source: string;
  target: string;
  findNodeUnderCursor: (
    clientX: number,
    clientY: number
  ) => { id: string } | undefined;
}

export const useEdgeDrag = ({
  id,
  source,
  target,
  findNodeUnderCursor,
}: UseEdgeDragProps) => {
  const { getEdges } = useReactFlow();

  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentTargetNode, setCurrentTargetNode] = useState<string | null>(
    null
  );

  const dragDataRef = useRef<EdgeDeleteEventDetail>({
    edgeId: id,
    source,
    target,
  });

  const isConnectionExists = useCallback(() => {
    if (!currentTargetNode) return false;
    const edges = getEdges();
    return edges.some(
      edge => edge.source === source && edge.target === currentTargetNode
    );
  }, [currentTargetNode, source, getEdges]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(true);
      setCurrentTargetNode(null);

      dragDataRef.current = { edgeId: id, source, target };

      const startEvent = new CustomEvent<EdgeDeleteEventDetail>(
        'edgeDeleteStart',
        {
          detail: dragDataRef.current,
        }
      );
      document.dispatchEvent(startEvent);

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        setDragPosition({ x: moveEvent.clientX, y: moveEvent.clientY });

        const targetNode = findNodeUnderCursor(
          moveEvent.clientX,
          moveEvent.clientY
        );
        setCurrentTargetNode(targetNode?.id || null);
      };

      const handleMouseUp = (upEvent: globalThis.MouseEvent) => {
        setIsDragging(false);
        setDragPosition(null);
        setCurrentTargetNode(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const targetNode = findNodeUnderCursor(
          upEvent.clientX,
          upEvent.clientY
        );

        const eventDetail: EdgeDeleteEventDetail = {
          ...dragDataRef.current,
          newTarget: targetNode?.id || null,
        };

        const dropEvent = new CustomEvent<EdgeDeleteEventDetail>(
          'edgeDeleteDrop',
          {
            detail: eventDetail,
          }
        );
        document.dispatchEvent(dropEvent);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [id, source, target, findNodeUnderCursor]
  );

  return {
    isDragging,
    dragPosition,
    currentTargetNode,
    isConnectionExists,
    handleMouseDown,
  };
};
