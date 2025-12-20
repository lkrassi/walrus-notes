import { useEffect, useRef } from 'react';
import type { Edge, Node } from 'reactflow';

type AnyEdge = Edge & {
  style?: { strokeWidth?: number; strokeDasharray?: string; opacity?: number };
  data?: {
    isRelatedToSelected?: boolean;
    isSelected?: boolean;
    [key: string]: unknown;
  };
};

interface UseGraphEffectsProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  tempEdges: Edge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setTempEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
}

export const useGraphEffects = ({
  initialNodes,
  initialEdges,
  tempEdges,
  selectedNodeId,
  hoveredNodeId,
  setNodes,
  setEdges,
  setTempEdges,
}: UseGraphEffectsProps) => {
  const prevInitialNodesRef = useRef(initialNodes);
  const prevInitialEdgesRef = useRef(initialEdges);
  const prevSelectedNodeIdRef = useRef(selectedNodeId);
  const prevHoveredNodeIdRef = useRef(hoveredNodeId);

  useEffect(() => {
    if (prevInitialNodesRef.current !== initialNodes) {
      setNodes(initialNodes);
      prevInitialNodesRef.current = initialNodes;
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (prevInitialEdgesRef.current !== initialEdges) {
      setEdges(initialEdges);
      prevInitialEdgesRef.current = initialEdges;
    }
  }, [initialEdges, setEdges]);

  useEffect(() => {
    if (tempEdges.length > 0) {
      setTempEdges(prev =>
        prev.filter(
          tempEdge =>
            !initialEdges.some(
              cacheEdge =>
                cacheEdge.source === tempEdge.source &&
                cacheEdge.target === tempEdge.target
            )
        )
      );
    }
  }, [initialEdges, tempEdges.length, setTempEdges]);

  useEffect(() => {
    if (
      prevSelectedNodeIdRef.current === selectedNodeId &&
      prevHoveredNodeIdRef.current === hoveredNodeId
    ) {
      return;
    }
    setTempEdges(prev => {
      const activeId = selectedNodeId ?? hoveredNodeId ?? null;

      let changed = false;
      const newTempEdges = prev.map(e => {
        const edge = e as AnyEdge;
        const isRelatedToSelected = activeId
          ? activeId === edge.source || activeId === edge.target
          : false;

        const newStyle = {
          ...edge.style,
          strokeWidth: isRelatedToSelected ? 3 : 2,
          strokeDasharray: isRelatedToSelected ? '0' : '5,5',
          opacity: isRelatedToSelected ? 1 : 0.3,
        };

        const newData = {
          ...edge.data,
          isRelatedToSelected,
          isSelected: isRelatedToSelected,
        };

        const styleChanged =
          edge.style?.strokeWidth !== newStyle.strokeWidth ||
          edge.style?.strokeDasharray !== newStyle.strokeDasharray ||
          edge.style?.opacity !== newStyle.opacity;
        const dataChanged =
          edge.data?.isRelatedToSelected !== newData.isRelatedToSelected ||
          edge.data?.isSelected !== newData.isSelected;

        if (!styleChanged && !dataChanged) return e;

        changed = true;
        return {
          ...edge,
          style: newStyle,
          data: newData,
        } as AnyEdge;
      });

      return changed ? newTempEdges : prev;
    });

    prevSelectedNodeIdRef.current = selectedNodeId;
    prevHoveredNodeIdRef.current = hoveredNodeId;
  }, [selectedNodeId, hoveredNodeId, setTempEdges]);
};
