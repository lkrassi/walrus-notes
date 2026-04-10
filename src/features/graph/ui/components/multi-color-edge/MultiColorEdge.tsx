import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { BaseEdge, type EdgeProps } from 'reactflow';
import { EDGE_INTERACTION, getEdgeColors } from './constants';
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

  const edgeColors = getEdgeColors();
  const strokeColor = data?.edgeColor || edgeColors.STROKE;
  const isBidirectional = Boolean(data?.isBidirectional);
  const reverseColor = data?.reverseEdgeColor;

  const { getNodeFlowInfo, chooseClosestAnchor, findNodeUnderCursor } =
    useEdgeGeometry(source);
  const viewportTick = useViewportTracking();

  const { isDragging, dragPosition, currentTargetNode, handleMouseDown } =
    useEdgeDrag({
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

  const dragStrokeColor = strokeColor;
  const markerSize = 9;
  const markerRefX = markerSize - 1;
  const markerRefY = markerSize / 2;
  const markerPath = `M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} z`;
  const bidirectionalGradientId = createMarkerId(id, 'bidirectional-gradient');
  const staticMarkerId = createMarkerId(id, 'static');
  const dragMarkerId = createMarkerId(id, 'drag');

  const edgeColor = isBidirectional
    ? `url(#${bidirectionalGradientId})`
    : strokeColor;
  const markerEnd = `url(#${staticMarkerId})`;
  const dragMarkerEnd = `url(#${dragMarkerId})`;

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
          markerEnd={markerEnd}
          style={{
            stroke: edgeColor,
            fill: 'none',
            ...style,
          }}
        />
      )}

      {isDragging && dragPosition && (
        <BaseEdge
          path={getDragEdgePath()}
          markerEnd={dragMarkerEnd}
          style={{
            ...style,
            stroke: dragStrokeColor,
            fill: 'none',
          }}
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
      <title>Перетащите связь для удаления или переподключения</title>
    </>
  );
});
