import { type FC } from 'react';

interface CoordinateOverlayProps {
  nodeId?: string | null;
  coords?: { x: number; y: number } | null;
  centerCoords?: { x: number; y: number } | null;
  rightOffset?: string;
}

export const CoordinateOverlay: FC<CoordinateOverlayProps> = ({
  nodeId,
  coords,
  centerCoords,
  rightOffset = '0px',
}) => {
  return (
    <div
      className='pointer-events-none absolute top-2 z-20 transition-[right] duration-300 ease-in-out'
      style={{ right: `calc(0.5rem + ${rightOffset})` }}
      aria-hidden
    >
      <div className='bg-bg dark:bg-dark-bg text-text dark:text-dark-text m-2 rounded p-2 text-xl shadow'>
        {centerCoords ? (
          <div className='text-xs'>
            {Math.round(centerCoords.x)}, y: {Math.round(centerCoords.y)}
          </div>
        ) : null}
        {coords ? (
          <div className='mt-1 font-medium'>
            {nodeId ? `Node: ${nodeId}` : 'Dragging'}
          </div>
        ) : null}
        {coords ? (
          <div className='text-xs'>
            x: {Math.round(coords.x)}, y: {Math.round(coords.y)}
          </div>
        ) : null}
      </div>
    </div>
  );
};
