import { memo } from 'react';
import { cn } from '@/shared/lib';
import { EDGE_COLORS, EDGE_INTERACTION } from './constants';

interface EdgeDeleteButtonProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export const EdgeDeleteButton = memo(function EdgeDeleteButton({
  sourceX,
  sourceY,
  targetX,
  targetY,
  onMouseDown,
  onClick,
}: EdgeDeleteButtonProps) {
  return (
    <g
      transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}
    >
      <circle
        r={EDGE_INTERACTION.DELETE_BUTTON_RADIUS}
        fill='white'
        stroke={EDGE_COLORS.DELETE_BUTTON}
        strokeWidth={EDGE_INTERACTION.DELETE_BUTTON_STROKE_WIDTH}
        className={cn(
          'cursor-grab opacity-0 transition-opacity duration-200 hover:opacity-100'
        )}
        onMouseDown={onMouseDown}
        onClick={onClick}
      />
      <text
        x='0'
        y='0'
        dy='.3em'
        textAnchor='middle'
        fontSize='10'
        fontWeight='bold'
        fill={EDGE_COLORS.DELETE_BUTTON}
        className={cn(
          'pointer-events-none opacity-0 transition-opacity duration-200 hover:opacity-100'
        )}
      >
        ×
      </text>
    </g>
  );
});
