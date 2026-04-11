import { useEffect, useState } from 'react';
import { Position, getBezierPath, useViewport } from 'reactflow';
import type { GraphRetractLineState } from '../../lib/context/GraphContext';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface GraphRetractLineProps {
  line: GraphRetractLineState;
}

export const GraphRetractLine = ({ line }: GraphRetractLineProps) => {
  const [progress, setProgress] = useState(0);
  const viewport = useViewport();

  useEffect(() => {
    let raf = 0;
    const startedAt = performance.now();
    const duration = Math.max(80, line.durationMs ?? 180);

    const tick = (now: number) => {
      const next = Math.min(1, (now - startedAt) / duration);
      setProgress(next);
      if (next < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [line.durationMs, line.id]);

  if (progress >= 1) {
    return null;
  }

  const eased = easeOutCubic(progress);
  const targetFlowX = line.startX + (line.sourceX - line.startX) * eased;
  const targetFlowY = line.startY + (line.sourceY - line.startY) * eased;

  const sourceX = line.sourceX * viewport.zoom + viewport.x;
  const sourceY = line.sourceY * viewport.zoom + viewport.y;
  const targetX = targetFlowX * viewport.zoom + viewport.x;
  const targetY = targetFlowY * viewport.zoom + viewport.y;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  const sourcePosition =
    Math.abs(dx) > Math.abs(dy)
      ? dx >= 0
        ? Position.Right
        : Position.Left
      : dy >= 0
        ? Position.Bottom
        : Position.Top;

  const targetPosition =
    Math.abs(dx) > Math.abs(dy)
      ? dx >= 0
        ? Position.Left
        : Position.Right
      : dy >= 0
        ? Position.Top
        : Position.Bottom;

  const path = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })[0];

  const markerId = `graph-retract-arrow-${line.id}`;

  return (
    <svg
      className='pointer-events-none absolute inset-0 z-30'
      width='100%'
      height='100%'
      aria-hidden='true'
    >
      <defs>
        <marker
          id={markerId}
          viewBox='0 0 9 9'
          markerWidth='9'
          markerHeight='9'
          refX='8'
          refY='4.5'
          orient='auto'
          markerUnits='userSpaceOnUse'
        >
          <path d='M 0 0 L 9 4.5 L 0 9 z' fill={line.color} />
        </marker>
      </defs>
      <path
        d={path}
        fill='none'
        stroke={line.color}
        strokeWidth={2}
        strokeDasharray='5,5'
        opacity={0.3}
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
};
