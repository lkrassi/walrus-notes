import { useDeleteNoteLinkMutation } from 'app/store/api';
import { memo, useCallback } from 'react';
import { BaseEdge, useReactFlow, type EdgeProps } from 'reactflow';
import { cn } from 'shared/lib/cn';
import { EDGE_COLORS, EDGE_INTERACTION } from './constants';
import { EdgeDeleteButton } from './EdgeDeleteButton';
import type { MultiColorStepEdgeData } from './types';
import { useEdgeDrag } from './useEdgeDrag';
import { useEdgeGeometry } from './useEdgeGeometry';
import { useEdgePath } from './useEdgePath';
import { useViewportTracking } from './useViewportTracking';

export const MultiColorEdge = memo(function MultiColorEdge(
  props: EdgeProps<MultiColorStepEdgeData>
) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    source,
    target,
    style = {},
    data,
  } = props;
  const { setEdges } = useReactFlow();

  const [deleteNoteLink] = useDeleteNoteLinkMutation();

  const strokeColor = data?.edgeColor || EDGE_COLORS.STROKE;

  const { getNodeFlowInfo, chooseClosestAnchor, findNodeUnderCursor } =
    useEdgeGeometry(source);

  const viewportTick = useViewportTracking();

  const {
    isDragging,
    dragPosition,
    currentTargetNode,
    isConnectionExists,
    handleMouseDown,
  } = useEdgeDrag({
    id,
    source,
    target,
    findNodeUnderCursor,
  });

  const { edgePath, getDragEdgePath } = useEdgePath({
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    viewportTick,
    getNodeFlowInfo,
    chooseClosestAnchor,
    dragPosition,
    currentTargetNode,
  });

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

  const getDragStrokeColor = () => {
    if (currentTargetNode) {
      return isConnectionExists() ? EDGE_COLORS.INVALID : EDGE_COLORS.VALID;
    }
    return strokeColor;
  };

  const markerEnd = undefined;
  const markerStart = undefined;

  return (
    <>
      {!isDragging && (
        <BaseEdge
          path={edgePath}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: strokeColor,
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
          markerStart={markerStart}
          markerEnd={markerEnd}
          fill='none'
          stroke={getDragStrokeColor()}
          strokeWidth={EDGE_INTERACTION.DRAG_STROKE_WIDTH}
          strokeDasharray='5,5'
          className={cn('animate-pulse')}
        />
      )}

      <path
        d={edgePath}
        fill='none'
        stroke='transparent'
        strokeWidth={EDGE_INTERACTION.TRANSPARENT_STROKE_WIDTH}
        className={cn('react-flow__edge-interaction cursor-crosshair')}
        onMouseDown={handleMouseDown}
      />

      {!isDragging && (
        <EdgeDeleteButton
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        />
      )}

      <title>Перетащите связь для удаления или переподключения</title>
    </>
  );
});
