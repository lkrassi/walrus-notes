import { useDeleteNoteLinkMutation } from '@/entities';
import { cn } from '@/shared/lib/core';
import { memo, useCallback } from 'react';
import { BaseEdge, useReactFlow, type EdgeProps } from 'reactflow';
import { EDGE_INTERACTION, getEdgeColors } from './constants';
import { EdgeDeleteButton } from './EdgeDeleteButton';
import type { MultiColorStepEdgeData } from './types';
import { useEdgeDrag } from './useEdgeDrag';
import { useEdgeGeometry } from './useEdgeGeometry';
import { useEdgePath } from './useEdgePath';
import { useViewportTracking } from './useViewportTracking';

const createMarkerId = (base: string, suffix: string) => {
  const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, '-');
  return `edge-arrow-${safeBase}-${suffix}`;
};

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
  const edgeColors = getEdgeColors();

  const [deleteNoteLink] = useDeleteNoteLinkMutation();

  const strokeColor = data?.edgeColor || edgeColors.STROKE;
  const isSelected = Boolean(data?.isSelected);
  const isRelated = Boolean(data?.isRelatedToSelected);
  const isBidirectional = Boolean(data?.isBidirectional);
  const reverseColor = data?.reverseEdgeColor;

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
      return isConnectionExists() ? edgeColors.INVALID : edgeColors.VALID;
    }
    return strokeColor;
  };

  const dragStrokeColor = getDragStrokeColor();

  const markerSize = isSelected ? 12 : isRelated ? 10 : 9;
  const markerRefX = markerSize - 1;
  const markerRefY = markerSize / 2;
  const markerPath = `M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} z`;

  const staticMarkerId = createMarkerId(id, 'static');
  const dragMarkerId = createMarkerId(id, 'drag');
  const bidirectionalGradientId = createMarkerId(id, 'bidirectional-gradient');
  const markerEnd = `url(#${staticMarkerId})`;
  const dragMarkerEnd = `url(#${dragMarkerId})`;
  const markerStart = undefined;

  // Для двунаправленной связи используем градиент как цвет
  const edgeColor = isBidirectional
    ? `url(#${bidirectionalGradientId})`
    : strokeColor;

  return (
    <>
      <defs>
        {isBidirectional && reverseColor && (
          <linearGradient
            id={bidirectionalGradientId}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='0%'
          >
            <stop offset='0%' stopColor={strokeColor} stopOpacity='1' />
            <stop offset='50%' stopColor={strokeColor} stopOpacity='1' />
            <stop offset='50%' stopColor={reverseColor} stopOpacity='1' />
            <stop offset='100%' stopColor={reverseColor} stopOpacity='1' />
          </linearGradient>
        )}
        <marker
          id={staticMarkerId}
          viewBox={`0 0 ${markerSize} ${markerSize}`}
          markerWidth={String(markerSize)}
          markerHeight={String(markerSize)}
          refX={String(markerRefX)}
          refY={String(markerRefY)}
          orient='auto'
          markerUnits='userSpaceOnUse'
        >
          <path d={markerPath} fill={strokeColor} />
        </marker>
        <marker
          id={dragMarkerId}
          viewBox={`0 0 ${markerSize} ${markerSize}`}
          markerWidth={String(markerSize)}
          markerHeight={String(markerSize)}
          refX={String(markerRefX)}
          refY={String(markerRefY)}
          orient='auto'
          markerUnits='userSpaceOnUse'
        >
          <path d={markerPath} fill={dragStrokeColor} />
        </marker>
      </defs>

      {!isDragging && (
        <BaseEdge
          path={edgePath}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: edgeColor,
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
          markerEnd={dragMarkerEnd}
          fill='none'
          stroke={dragStrokeColor}
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
