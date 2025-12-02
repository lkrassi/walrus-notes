import React, { useCallback } from 'react';
import { MiniMap, type Node } from 'reactflow';

const GraphMiniMapInner = () => {
  const nodeColor = useCallback((_node: Node) => {
    // fixed neutral color for nodes in minimap
    return '#6b7280';
  }, []);

  return (
    <MiniMap
      nodeColor={nodeColor}
      maskColor='rgba(0, 0, 0, 0.1)'
      nodeStrokeColor='#000'
      nodeBorderRadius={2}
      nodeStrokeWidth={1}
      maskStrokeColor='rgba(0, 0, 0, 0.5)'
      maskStrokeWidth={2}
      position='bottom-right'
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #e5e7eb',
      }}
    />
  );
};

export const GraphMiniMap = React.memo(GraphMiniMapInner);
GraphMiniMap.displayName = 'GraphMiniMap';
