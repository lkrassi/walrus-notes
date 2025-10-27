import { BaseEdge, type EdgeProps, getBezierPath } from 'reactflow';

interface MultiColorStepEdgeData {
  sourceColor: string;
  targetColor: string;
  isRelatedToSelected?: boolean;
  isSelected?: boolean;
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
  selected,
}: EdgeProps<MultiColorStepEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const gradientId = `gradient-${id}`;
  const { sourceColor, targetColor, isRelatedToSelected, isSelected } =
    data || {};

  // Определяем прозрачность на основе связи с выбранной заметкой
  const getOpacity = () => {
    if (isSelected) return 1; // Выбранное ребро
    if (isRelatedToSelected) return 1; // Ребро связанное с выбранной заметкой
    return 0.3; // Все остальные ребра
  };

  const getStrokeWidth = () => {
    if (isSelected) return 4;
    if (isRelatedToSelected) return 3;
    return 2;
  };

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
          strokeWidth: getStrokeWidth(),
          fill: 'none',
          opacity: getOpacity(),
        }}
      />
    </>
  );
};
