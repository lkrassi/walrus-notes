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
  const { screenToFlowPosition } = useReactFlow();

  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const dragDataRef = useRef<EdgeDeleteEventDetail>({
    edgeId: id,
    source,
    target,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(true);

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
      };

      const handleMouseUp = (upEvent: globalThis.MouseEvent) => {
        setIsDragging(false);
        setDragPosition(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const targetNode = findNodeUnderCursor(
          upEvent.clientX,
          upEvent.clientY
        );

        const eventDetail: EdgeDeleteEventDetail = {
          ...dragDataRef.current,
          newTarget: targetNode?.id || null,
          dropFlowX: screenToFlowPosition({
            x: upEvent.clientX,
            y: upEvent.clientY,
          }).x,
          dropFlowY: screenToFlowPosition({
            x: upEvent.clientX,
            y: upEvent.clientY,
          }).y,
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
    [id, source, target, findNodeUnderCursor, screenToFlowPosition]
  );

  return {
    isDragging,
    dragPosition,
    handleMouseDown,
  };
};
