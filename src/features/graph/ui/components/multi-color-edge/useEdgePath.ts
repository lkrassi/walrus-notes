import { useMemo } from 'react';
import { getBezierPath, Position, useReactFlow } from 'reactflow';

interface UseEdgePathProps {
  edgeId: string;
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
  findNodeUnderCursor: (
    clientX: number,
    clientY: number
  ) => { id: string } | undefined;
}

export const useEdgePath = ({
  edgeId,
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
  findNodeUnderCursor,
}: UseEdgePathProps) => {
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

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

  const edgeEndpoints = useMemo(() => {
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

    return {
      sourceAnchor,
      targetAnchor,
      sourcePosition,
      targetPosition,
    };
  }, [
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    getNodeFlowInfo,
    chooseClosestAnchor,
    viewportTick,
  ]);

  const getDragEdgeEndpoints = () => {
    const usePos = dragPosition;
    if (!usePos) return null;

    const flowPosition = screenToFlowPosition({ x: usePos.x, y: usePos.y });
    const sourceInfo = getNodeFlowInfo(source, sourceX, sourceY);
    const sourceAnchor = chooseClosestAnchor(sourceInfo.anchors, flowPosition);
    const sourcePosition = resolvePositionFromAnchor(
      sourceAnchor,
      sourceInfo.anchors
    );

    const hoveredNode = findNodeUnderCursor(usePos.x, usePos.y);
    const candidateTargetNodeId = hoveredNode?.id ?? null;
    const isSelfTarget =
      candidateTargetNodeId !== null && candidateTargetNodeId === source;
    const isInvalidTarget =
      isSelfTarget ||
      (candidateTargetNodeId !== null &&
        getEdges().some(
          edge =>
            edge.id !== edgeId &&
            edge.source === source &&
            edge.target === candidateTargetNodeId
        ));

    const effectiveTargetNodeId = isInvalidTarget
      ? null
      : candidateTargetNodeId;

    if (effectiveTargetNodeId) {
      const targetInfo = getNodeFlowInfo(
        effectiveTargetNodeId,
        targetX,
        targetY
      );
      const targetAnchor = chooseClosestAnchor(
        targetInfo.anchors,
        sourceInfo.center
      );
      const targetPosition = resolvePositionFromAnchor(
        targetAnchor,
        targetInfo.anchors
      );

      return {
        sourceAnchor,
        targetAnchor,
        sourcePosition,
        targetPosition,
      };
    }

    return {
      sourceAnchor,
      targetAnchor: flowPosition,
      sourcePosition,
    };
  };

  const getDragEdgePath = () => {
    const usePos = dragPosition;
    if (!usePos) return '';

    const flowPosition = screenToFlowPosition({ x: usePos.x, y: usePos.y });
    const endpoints = getDragEdgeEndpoints();
    if (!endpoints) {
      return '';
    }

    const { sourceAnchor, sourcePosition } = endpoints;

    const resolveFloatingTargetPosition = (
      from: { x: number; y: number },
      to: { x: number; y: number }
    ): Position => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx >= 0 ? Position.Left : Position.Right;
      }

      return dy >= 0 ? Position.Top : Position.Bottom;
    };

    if (endpoints.targetPosition) {
      const { targetAnchor, targetPosition } = endpoints;
      if (!targetPosition) {
        return '';
      }

      return getBezierPath({
        sourceX: sourceAnchor.x,
        sourceY: sourceAnchor.y,
        targetX: targetAnchor.x,
        targetY: targetAnchor.y,
        sourcePosition,
        targetPosition,
      })[0];
    }

    const targetPosition = resolveFloatingTargetPosition(
      sourceAnchor,
      flowPosition
    );

    return getBezierPath({
      sourceX: sourceAnchor.x,
      sourceY: sourceAnchor.y,
      targetX: flowPosition.x,
      targetY: flowPosition.y,
      sourcePosition,
      targetPosition,
    })[0];
  };

  return {
    edgePath,
    edgeEndpoints,
    getDragEdgeEndpoints,
    getDragEdgePath,
  };
};
