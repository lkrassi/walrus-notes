import React, { useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import type { Node } from 'reactflow';
// color generation removed; prefer server-provided layout color

interface OffscreenArrowsProps {
  nodes: Node[];
  minDistance?: number;
  maxArrows?: number;
}

function intersectRect(
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  width: number,
  height: number
) {
  const ts: number[] = [];

  if (dx !== 0) {
    const tLeft = (0 - cx) / dx;
    const tRight = (width - cx) / dx;
    ts.push(tLeft, tRight);
  }
  if (dy !== 0) {
    const tTop = (0 - cy) / dy;
    const tBottom = (height - cy) / dy;
    ts.push(tTop, tBottom);
  }

  const valid = ts.filter(t => t > 0).sort((a, b) => a - b);
  for (const t of valid) {
    const x = cx + dx * t;
    const y = cy + dy * t;
    if (x >= -1 && x <= width + 1 && y >= -1 && y <= height + 1) {
      return { x, y, t };
    }
  }
  return null;
}

export const OffscreenArrows: React.FC<OffscreenArrowsProps> = ({
  nodes,
  minDistance = 50,
  maxArrows = 100,
}) => {
  const { getViewport } = useReactFlow();
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<Array<any>>([]);

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const vp = getViewport();
      const wrapper = document.querySelector(
        '.react-flow'
      ) as HTMLElement | null;
      if (!wrapper || !vp) {
        stateRef.current = [];
      } else {
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;
        const zoom = vp.zoom ?? 1;
        const panX = vp.x ?? 0;
        const panY = vp.y ?? 0;
        const cx = width / 2;
        const cy = height / 2;

        const arrows: Array<any> = [];
        for (const n of nodes) {
          const nx = (n.position?.x ?? 0) * zoom + panX;
          const ny = (n.position?.y ?? 0) * zoom + panY;

          if (nx >= 0 && nx <= width && ny >= 0 && ny <= height) continue;

          const dx = nx - cx;
          const dy = ny - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < minDistance) continue;

          const intersection = intersectRect(cx, cy, dx, dy, width, height);
          if (!intersection) continue;

          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          // use neutral color for offscreen arrows
          const color = '#6b7280';

          arrows.push({
            id: n.id,
            x: intersection.x,
            y: intersection.y,
            angle,
            dist,
            color,
          });
          if (arrows.length >= maxArrows) break;
        }

        stateRef.current = arrows;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getViewport, nodes, minDistance, maxArrows]);

  const arrows = stateRef.current;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 65,
      }}
      aria-hidden
    >
      {arrows.map(a => (
        <div
          key={a.id}
          style={{
            position: 'absolute',
            left: Math.max(
              8,
              Math.min(
                (document.querySelector('.react-flow') as HTMLElement | null)
                  ?.clientWidth ?? window.innerWidth - 24,
                a.x
              )
            ),
            top: Math.max(
              8,
              Math.min(
                (document.querySelector('.react-flow') as HTMLElement | null)
                  ?.clientHeight ?? window.innerHeight - 24,
                a.y
              )
            ),
            transform: `translate(-50%,-50%) rotate(${a.angle}deg)`,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            style={{ display: 'block' }}
          >
            <path
              d='M2 12 L18 12 M12 6 L18 12 L12 18'
              stroke={a.color ?? 'rgba(255,80,80,0.95)'}
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default OffscreenArrows;
