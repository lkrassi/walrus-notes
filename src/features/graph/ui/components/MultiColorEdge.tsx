import { useDeleteNoteLinkMutation } from 'app/store/api';
import { useCallback, useRef, useState } from 'react';
import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import cn from 'shared/lib/cn';

interface MultiColorStepEdgeData {
  sourceColor: string;
  targetColor: string;
  isRelatedToSelected?: boolean;
  isSelected?: boolean;
}

interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
}

export const MultiColorEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  style = {},
  data,
  markerEnd,
}: EdgeProps<MultiColorStepEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { setEdges, screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const [deleteNoteLink] = useDeleteNoteLinkMutation();
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

  const gradientId = `gradient-${id}`;
  const { sourceColor, targetColor } = data || {};

  const findNodeUnderCursor = useCallback(
    (clientX: number, clientY: number) => {
      const flowPosition = screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      const nodes = getNodes();
      return nodes.find(node => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const nodeWidth = node.width || 160;
        const nodeHeight = node.height || 80;

        return (
          flowPosition.x >= nodeX &&
          flowPosition.x <= nodeX + nodeWidth &&
          flowPosition.y >= nodeY &&
          flowPosition.y <= nodeY + nodeHeight &&
          node.id !== source
        );
      });
    },
    [screenToFlowPosition, getNodes, source]
  );

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

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setDragPosition({ x: moveEvent.clientX, y: moveEvent.clientY });

        const targetNode = findNodeUnderCursor(
          moveEvent.clientX,
          moveEvent.clientY
        );
        setCurrentTargetNode(targetNode?.id || null);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
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

  const handleDeleteEdge = useCallback(async () => {
    try {
      const edgeParts = id.split('-');
      const layoutId = edgeParts[2] || 'default';

      await deleteNoteLink({
        layoutId,
        firstNoteId: source,
        secondNoteId: target,
      }).unwrap();

      setEdges(eds => eds.filter(e => e.id !== id));
    } catch (_error) {}
  }, [id, source, target, deleteNoteLink, setEdges]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Удалить связь между заметками?')) {
        handleDeleteEdge();
      }
    },
    [handleDeleteEdge]
  );

  const getDragEdgePath = () => {
    if (!dragPosition) return '';

    const flowPosition = screenToFlowPosition({
      x: dragPosition.x,
      y: dragPosition.y,
    });

    if (currentTargetNode) {
      const targetNode = getNodes().find(node => node.id === currentTargetNode);
      if (targetNode) {
        const targetNodeCenterX =
          targetNode.position.x + (targetNode.width || 160) / 2;
        const targetNodeCenterY =
          targetNode.position.y + (targetNode.height || 80) / 2;
        return `M ${sourceX} ${sourceY} L ${targetNodeCenterX} ${targetNodeCenterY}`;
      }
    }

    return `M ${sourceX} ${sourceY} L ${flowPosition.x} ${flowPosition.y}`;
  };

  const isConnectionExists = useCallback(() => {
    if (!currentTargetNode) return false;

    const edges = getEdges();
    return edges.some(
      edge => edge.source === source && edge.target === currentTargetNode
    );
  }, [currentTargetNode, source, getEdges]);

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor={sourceColor || '#6b7280'} />
          <stop offset='100%' stopColor={targetColor || '#6b7280'} />
        </linearGradient>

        <linearGradient
          id={`${gradientId}-valid`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'
        >
          <stop offset='0%' stopColor='#10b981' />
          <stop offset='100%' stopColor='#10b981' />
        </linearGradient>

        <linearGradient
          id={`${gradientId}-invalid`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'
        >
          <stop offset='0%' stopColor='#ef4444' />
          <stop offset='100%' stopColor='#ef4444' />
        </linearGradient>
      </defs>

      {!isDragging && (
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            stroke: `url(#${gradientId})`,
            fill: 'none',
            transition:
              'stroke-width 180ms ease, opacity 180ms ease, stroke-dasharray 180ms ease',
            ...style,
          }}
        />
      )}

      {isDragging && dragPosition && (
        <path
          d={getDragEdgePath()}
          fill='none'
          stroke={
            currentTargetNode
              ? isConnectionExists()
                ? `url(#${gradientId}-invalid)`
                : `url(#${gradientId}-valid)`
              : `url(#${gradientId})`
          }
          strokeWidth='3'
          strokeDasharray='5,5'
          markerEnd={markerEnd}
          className={cn('animate-pulse')}
        />
      )}

      <path
        d={edgePath}
        fill='none'
        stroke='transparent'
        strokeWidth='20'
        className={cn('react-flow__edge-interaction cursor-crosshair')}
        onMouseDown={handleMouseDown}
      />

      {!isDragging && (
        <g
          transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}
        >
          <circle
            r='8'
            fill='white'
            stroke='#ff6b6b'
            strokeWidth='2'
            className={cn(
              'cursor-grab opacity-0 transition-opacity duration-200 hover:opacity-100'
            )}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
          />
          <text
            x='0'
            y='0'
            dy='.3em'
            textAnchor='middle'
            fontSize='10'
            fontWeight='bold'
            fill='#ff6b6b'
            className={cn(
              'pointer-events-none opacity-0 transition-opacity duration-200 hover:opacity-100'
            )}
          >
            ×
          </text>
        </g>
      )}

      <title>Перетащите связь для удаления или переподключения</title>
    </>
  );
};
