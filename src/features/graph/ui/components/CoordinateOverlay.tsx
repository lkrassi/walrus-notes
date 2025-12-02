import React from 'react';

interface CoordinateOverlayProps {
  nodeId?: string | null;
  coords?: { x: number; y: number } | null;
  centerCoords?: { x: number; y: number } | null;
}

export const CoordinateOverlay: React.FC<CoordinateOverlayProps> = ({
  nodeId,
  coords,
  centerCoords,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 70,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <div className='bg-bg dark:bg-dark-bg text-text dark:text-dark-text rounded text-xl shadow m-2 p-2'>
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

export default CoordinateOverlay;
