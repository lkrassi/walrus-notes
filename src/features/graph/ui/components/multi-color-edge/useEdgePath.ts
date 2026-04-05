import { useMemo } from 'react';
import { getBezierPath, Position, useReactFlow } from 'reactflow';

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

  const resolvePositionFromAnchor = (
    anchor: { x: number; y: number },
    anchors: {
      top: { x: number; y: number };
      right: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
    }
  ): Position => {
    const eps = 0.0001;

    if (
      Math.abs(anchor.x - anchors.left.x) < eps &&
      Math.abs(anchor.y - anchors.left.y) < eps
    ) {
      return Position.Left;
    }

    if (
      Math.abs(anchor.x - anchors.right.x) < eps &&
      Math.abs(anchor.y - anchors.right.y) < eps
    ) {
      return Position.Right;
    }

    if (
      Math.abs(anchor.x - anchors.top.x) < eps &&
      Math.abs(anchor.y - anchors.top.y) < eps
    ) {
      return Position.Top;
    }

    if (
      Math.abs(anchor.x - anchors.bottom.x) < eps &&
      Math.abs(anchor.y - anchors.bottom.y) < eps
    ) {
      return Position.Bottom;
    }

    return Position.Right;
  };

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

    const sourcePosition = resolvePositionFromAnchor(
      sourceAnchor,
      sourceInfo.anchors
    );
    const targetPosition = resolvePositionFromAnchor(
      targetAnchor,
      targetInfo.anchors
    );

    return getBezierPath({
      sourceX: sourceAnchor.x,
      sourceY: sourceAnchor.y,
      targetX: targetAnchor.x,
      targetY: targetAnchor.y,
      sourcePosition,
      targetPosition,
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
