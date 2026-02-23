import { useMemo } from 'react';
import { getBezierPath, useReactFlow } from 'reactflow';

interface UseEdgePathProps {
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  viewportTick: number;
  getNodeFlowInfo: (
    nodeId: string | null,
    fallbackX: number,
    fallbackY: number
  ) => {
    center: { x: number; y: number };
    anchors: {
      top: { x: number; y: number };
      right: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
    };
  };
  chooseClosestAnchor: (
    anchors: {
      top: { x: number; y: number };
      right: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
    },
    point: { x: number; y: number }
  ) => { x: number; y: number };
  dragPosition: { x: number; y: number } | null;
  currentTargetNode: string | null;
}

export const useEdgePath = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  viewportTick,
  getNodeFlowInfo,
  chooseClosestAnchor,
  dragPosition,
  currentTargetNode,
}: UseEdgePathProps) => {
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const edgePath = useMemo(() => {
    const sourceInfo = getNodeFlowInfo(source, sourceX, sourceY);
    const targetInfo = getNodeFlowInfo(target, targetX, targetY);

    const sourceAnchor = chooseClosestAnchor(
      sourceInfo.anchors,
      targetInfo.center
    );
    const targetAnchor = chooseClosestAnchor(
      targetInfo.anchors,
      sourceInfo.center
    );

    return getBezierPath({
      sourceX: sourceAnchor.x,
      sourceY: sourceAnchor.y,
      targetX: targetAnchor.x,
      targetY: targetAnchor.y,
    })[0];
  }, [
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    getNodeFlowInfo,
    chooseClosestAnchor,
    screenToFlowPosition,
    getNodes,
    viewportTick,
  ]);

  const getDragEdgePath = () => {
    const usePos = dragPosition;
    if (!usePos) return '';

    const flowPosition = screenToFlowPosition({ x: usePos.x, y: usePos.y });

    const sourceInfo = getNodeFlowInfo(source, sourceX, sourceY);

    if (currentTargetNode) {
      const targetInfo = getNodeFlowInfo(currentTargetNode, targetX, targetY);
      const sourceAnchor = chooseClosestAnchor(
        sourceInfo.anchors,
        flowPosition
      );
      const targetAnchor = chooseClosestAnchor(
        targetInfo.anchors,
        sourceInfo.center
      );
      return `M ${sourceAnchor.x} ${sourceAnchor.y} L ${targetAnchor.x} ${targetAnchor.y}`;
    }

    const sourceAnchor = chooseClosestAnchor(sourceInfo.anchors, flowPosition);
    return `M ${sourceAnchor.x} ${sourceAnchor.y} L ${flowPosition.x} ${flowPosition.y}`;
  };

  return {
    edgePath,
    getDragEdgePath,
  };
};
