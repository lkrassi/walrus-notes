import React, { useCallback } from 'react';
import { MiniMap, type Node } from 'reactflow';
import { generateColorFromId } from '../../model/utils/graphUtils';

const GraphMiniMapInner = () => {
  const nodeColor = useCallback((node: Node) => {
    const maybeData = node.data as { nodeColor?: string } | undefined;
    return maybeData?.nodeColor || generateColorFromId(node.id);
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
