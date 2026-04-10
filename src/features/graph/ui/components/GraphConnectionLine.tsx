import {
  BaseEdge,
  Position,
  getBezierPath,
  useReactFlow,
  type ConnectionLineComponentProps,
} from 'reactflow';
import { graphTheme } from '../../lib/utils';

const MARKER_ID = 'graph-connection-line-arrow';
const NODE_FALLBACK_WIDTH = 160;
const NODE_FALLBACK_HEIGHT = 80;

type FlowNodeLike = {
  id: string;
  position: { x: number; y: number };
  width?: number | null;
  height?: number | null;
  data?: { layoutColor?: string };
};

type ExtendedConnectionLineProps = ConnectionLineComponentProps & {
  fromNode?: FlowNodeLike;
};

export const GraphConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  toPosition,
  fromNode,
}: ExtendedConnectionLineProps) => {
  const { getNodes, getEdges } = useReactFlow();
  const palette = graphTheme();

  const sourceNodeId = fromNode?.id;

  const isInvalidTargetNode = (node: FlowNodeLike) => {
    if (!sourceNodeId) {
      return false;
    }

    return getEdges().some(
      edge => edge.source === sourceNodeId && edge.target === node.id
    );
  };

  const getNodeFlowInfo = (
    node: FlowNodeLike | undefined,
    fallbackX: number,
    fallbackY: number
  ) => {
    const fallbackCenter = { x: fallbackX, y: fallbackY };

    if (!node) {
      const halfWidth = NODE_FALLBACK_WIDTH / 2;
      const halfHeight = NODE_FALLBACK_HEIGHT / 2;

      return {
        center: fallbackCenter,
        anchors: {
          top: { x: fallbackX, y: fallbackY - halfHeight },
          right: { x: fallbackX + halfWidth, y: fallbackY },
          bottom: { x: fallbackX, y: fallbackY + halfHeight },
          left: { x: fallbackX - halfWidth, y: fallbackY },
        },
      };
    }

    const width = node.width || NODE_FALLBACK_WIDTH;
    const height = node.height || NODE_FALLBACK_HEIGHT;
    const centerX = node.position.x + width / 2;
    const centerY = node.position.y + height / 2;

    return {
      center: { x: centerX, y: centerY },
      anchors: {
        top: { x: centerX, y: node.position.y },
        bottom: { x: centerX, y: node.position.y + height },
        left: { x: node.position.x, y: centerY },
        right: { x: node.position.x + width, y: centerY },
      },
    };
  };

  const chooseClosestAnchor = (
    anchors: {
      top: { x: number; y: number };
      right: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
    },
    point: { x: number; y: number }
  ) => {
    const list = [anchors.top, anchors.right, anchors.bottom, anchors.left];
    let min = Infinity;
    let pick = list[0];

    for (const anchor of list) {
      const dx = anchor.x - point.x;
      const dy = anchor.y - point.y;
      const distance = dx * dx + dy * dy;
      if (distance < min) {
        min = distance;
        pick = anchor;
      }
    }

    return pick;
  };

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

  const hoveredNode = getNodes().find(node => {
    const width = node.width || NODE_FALLBACK_WIDTH;
    const height = node.height || NODE_FALLBACK_HEIGHT;

    return (
      toX >= node.position.x &&
      toX <= node.position.x + width &&
      toY >= node.position.y &&
      toY <= node.position.y + height &&
      node.id !== sourceNodeId &&
      !isInvalidTargetNode(node as FlowNodeLike)
    );
  }) as FlowNodeLike | undefined;

  const resolveFloatingTargetPosition = (
    sourcePoint: { x: number; y: number },
    targetPoint: { x: number; y: number }
  ): Position => {
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? Position.Left : Position.Right;
    }

    return dy >= 0 ? Position.Top : Position.Bottom;
  };

  const sourceInfo = getNodeFlowInfo(fromNode, fromX, fromY);
  const sourceAnchor = chooseClosestAnchor(sourceInfo.anchors, {
    x: toX,
    y: toY,
  });
  const sourcePosition = resolvePositionFromAnchor(
    sourceAnchor,
    sourceInfo.anchors
  );

  const targetInfo = getNodeFlowInfo(hoveredNode, toX, toY);
  const targetAnchor = hoveredNode
    ? chooseClosestAnchor(targetInfo.anchors, sourceInfo.center)
    : { x: toX, y: toY };
  const targetPosition = hoveredNode
    ? resolvePositionFromAnchor(targetAnchor, targetInfo.anchors)
    : resolveFloatingTargetPosition(sourceAnchor, { x: toX, y: toY });

  const strokeColor = fromNode?.data?.layoutColor || palette.edge;

  const path = getBezierPath({
    sourceX: sourceAnchor.x,
    sourceY: sourceAnchor.y,
    targetX: targetAnchor.x,
    targetY: targetAnchor.y,
    sourcePosition,
    targetPosition: toPosition ?? targetPosition,
  })[0];

  return (
    <>
      <defs>
        <marker
          id={MARKER_ID}
          viewBox='0 0 9 9'
          markerWidth='9'
          markerHeight='9'
          refX='8'
          refY='4.5'
          orient='auto'
          markerUnits='userSpaceOnUse'
        >
          <path d='M 0 0 L 9 4.5 L 0 9 z' fill={strokeColor} />
        </marker>
      </defs>
      <BaseEdge
        path={path}
        markerEnd={`url(#${MARKER_ID})`}
        style={{
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: '5,5',
          opacity: 0.3,
        }}
      />
    </>
  );
};
