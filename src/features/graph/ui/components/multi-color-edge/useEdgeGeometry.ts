import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { NODE_DEFAULTS } from './constants';
import type { NodeFlowInfo } from './types';

export const useEdgeGeometry = (source: string) => {
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const getNodeFlowInfo = useCallback(
    (
      nodeId: string | null,
      fallbackX: number,
      fallbackY: number
    ): NodeFlowInfo => {
      const fallbackCenter = { x: fallbackX, y: fallbackY };
      if (!nodeId) {
        const hw = NODE_DEFAULTS.WIDTH / 2;
        const hh = NODE_DEFAULTS.HEIGHT / 2;
        return {
          center: fallbackCenter,
          anchors: {
            top: { x: fallbackX, y: fallbackY - hh },
            right: { x: fallbackX + hw, y: fallbackY },
            bottom: { x: fallbackX, y: fallbackY + hh },
            left: { x: fallbackX - hw, y: fallbackY },
          },
        };
      }

      const node = getNodes().find(n => n.id === nodeId);
      if (node) {
        const cx = node.position.x + (node.width || NODE_DEFAULTS.WIDTH) / 2;
        const cy = node.position.y + (node.height || NODE_DEFAULTS.HEIGHT) / 2;
        const w = node.width || NODE_DEFAULTS.WIDTH;
        const h = node.height || NODE_DEFAULTS.HEIGHT;
        return {
          center: { x: cx, y: cy },
          anchors: {
            top: { x: cx, y: node.position.y },
            right: { x: node.position.x + w, y: cy },
            bottom: { x: cx, y: node.position.y + h },
            left: { x: node.position.x, y: cy },
          },
        };
      }

      const hw = NODE_DEFAULTS.WIDTH / 2;
      const hh = NODE_DEFAULTS.HEIGHT / 2;
      return {
        center: fallbackCenter,
        anchors: {
          top: { x: fallbackX, y: fallbackY - hh },
          right: { x: fallbackX + hw, y: fallbackY },
          bottom: { x: fallbackX, y: fallbackY + hh },
          left: { x: fallbackX - hw, y: fallbackY },
        },
      };
    },
    [getNodes]
  );

  const chooseClosestAnchor = useCallback(
    (
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
      for (const a of list) {
        const dx = a.x - point.x;
        const dy = a.y - point.y;
        const d = dx * dx + dy * dy;
        if (d < min) {
          min = d;
          pick = a;
        }
      }
      return pick;
    },
    []
  );

  const findNodeUnderCursor = useCallback(
    (clientX: number, clientY: number) => {
      const flowPosition = screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      const nodes = getNodes();
      return nodes.find(node => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const nodeWidth = node.width || NODE_DEFAULTS.WIDTH;
        const nodeHeight = node.height || NODE_DEFAULTS.HEIGHT;

        return (
          flowPosition.x >= nodeX &&
          flowPosition.x <= nodeX + nodeWidth &&
          flowPosition.y >= nodeY &&
          flowPosition.y <= nodeY + nodeHeight &&
          node.id !== source
        );
      });
    },
    [screenToFlowPosition, getNodes, source]
  );

  return {
    getNodeFlowInfo,
    chooseClosestAnchor,
    findNodeUnderCursor,
  };
};
