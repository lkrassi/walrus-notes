import { type FC } from 'react';
import { MiniMap } from 'reactflow';

interface GraphMiniMapProps {
  rightOffset?: string;
}

export const GraphMiniMap: FC<GraphMiniMapProps> = ({
  rightOffset = '0px',
}) => {
  return (
    <MiniMap
      pannable
      zoomable
      position='bottom-right'
      style={{
        width: 160,
        height: 108,
        borderRadius: 0,
        border: '1px solid rgba(120,120,120,0.28)',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(6px)',
        right: `calc(0.5rem + ${rightOffset})`,
        transition: 'right 300ms ease-in-out',
      }}
      nodeStrokeWidth={3}
    />
  );
};
