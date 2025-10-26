import { BaseEdge, type EdgeProps, getBezierPath } from 'reactflow';

interface MultiColorStepEdgeData {
  sourceColor: string;
  targetColor: string;
}

export const MultiColorEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
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

  const gradientId = `gradient-${id}`;
  const { sourceColor, targetColor } = data || {};

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor={sourceColor || '#6b7280'} />
          <stop offset='100%' stopColor={targetColor || '#6b7280'} />
        </linearGradient>
      </defs>

      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: style.strokeWidth || 3,
          fill: 'none',
        }}
      />
    </>
  );
};
