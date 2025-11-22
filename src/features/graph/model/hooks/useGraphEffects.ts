import { useEffect, useRef } from 'react';
import type { Edge, Node } from 'reactflow';

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
            !initialEdges.some(cacheEdge => cacheEdge.id === tempEdge.id)
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
      const newTempEdges = prev.map(edge => {
        const activeId = selectedNodeId ?? hoveredNodeId ?? null;
        const isRelatedToSelected = activeId
          ? activeId === edge.source || activeId === edge.target
          : false;

        return {
          ...edge,
          style: {
            ...edge.style,
            strokeWidth: isRelatedToSelected ? 3 : 2,
            strokeDasharray: isRelatedToSelected ? '0' : '5,5',
            opacity: isRelatedToSelected ? 1 : 0.3,
          },
          data: {
            ...edge.data,
            isRelatedToSelected,
            isSelected: isRelatedToSelected,
          },
        };
      });

      return newTempEdges;
    });

    prevSelectedNodeIdRef.current = selectedNodeId;
    prevHoveredNodeIdRef.current = hoveredNodeId;
  }, [selectedNodeId, hoveredNodeId, setTempEdges]);
};
