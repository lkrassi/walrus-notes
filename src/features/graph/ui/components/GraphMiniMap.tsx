import { memo, useCallback } from 'react';
import { MiniMap, type Node } from 'reactflow';
import { graphTheme } from '../../lib/utils';

interface GraphMiniMapProps {
  xOffset?: string;
}

export const GraphMiniMap = memo(function GraphMiniMap({
  xOffset = '0px',
}: GraphMiniMapProps) {
  const palette = graphTheme();

  const nodeColor = useCallback(
    (node: Node) => {
      try {
        const color = (node?.data as { layoutColor?: string } | undefined)
          ?.layoutColor;
        return color ?? palette.node;
      } catch (_e) {
        return palette.node;
      }
    },
    [palette.node]
  );

  return (
    <MiniMap
      nodeColor={nodeColor}
      maskColor={palette.hover}
      nodeStrokeColor={palette.text}
      nodeBorderRadius={2}
      nodeStrokeWidth={1}
      maskStrokeColor={palette.edge}
      maskStrokeWidth={2}
      position='bottom-right'
      style={{
        transform: `translateX(calc(-1 * ${xOffset}))`,
        transition: 'transform 300ms ease-in-out',
      }}
    />
  );
});
