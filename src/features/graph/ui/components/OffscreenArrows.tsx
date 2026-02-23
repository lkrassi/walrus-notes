import { type FC } from 'react';
import type { Node } from 'reactflow';
import { useOffscreenArrows } from './hooks/useOffscreenArrows';

interface OffscreenArrowsProps {
  nodes: Node[];
  minDistance?: number;
  maxArrows?: number;
  isMain?: boolean;
}

export const OffscreenArrows: FC<OffscreenArrowsProps> = ({
  nodes,
  minDistance = 50,
  maxArrows = 100,
  isMain = false,
}) => {
  const { arrows } = useOffscreenArrows({
    nodes,
    minDistance,
    maxArrows,
    isMain,
  });

  return (
    <div className={'pointer-events-none absolute inset-0 z-60'} aria-hidden>
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
