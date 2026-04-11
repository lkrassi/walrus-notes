import { useCallback, useState, type MouseEvent } from 'react';
import type { Node, ReactFlowProps } from 'reactflow';

interface UseGraphNodeInteractionsProps {
  nodesWithSelection: Node[];
  onNodeDragStop?: ReactFlowProps['onNodeDragStop'];
  onTouchNodePositionChange?: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
}

export const useGraphNodeInteractions = ({
  nodesWithSelection,
  onNodeDragStop,
}: UseGraphNodeInteractionsProps) => {
  const [overlayCoords, setOverlayCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleNodeDrag = useCallback((_event: MouseEvent, node: Node) => {
    setOverlayCoords({ x: node.position.x, y: node.position.y });
  }, []);

  const handleNodeDragStop = useCallback(
    (event: MouseEvent, node: Node, nodes: Node[]) => {
      setOverlayCoords(null);
      onNodeDragStop?.(
        event,
        node,
        Array.isArray(nodes) && nodes.length > 0
          ? nodes
          : (nodesWithSelection as Node[])
      );
    },
    [onNodeDragStop, nodesWithSelection]
  );

  const handleTouchNodePositionChange = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      const node = nodesWithSelection.find(n => n.id === nodeId);
      if (!node || !onNodeDragStop) return;

      const updatedNode = { ...node, position };
      onNodeDragStop({} as MouseEvent, updatedNode, [updatedNode]);
    },
    [nodesWithSelection, onNodeDragStop]
  );

  return {
    overlayCoords,
    handleNodeDrag,
    handleNodeDragStop,
    handleTouchNodePositionChange,
  };
};
