import { useEffect } from 'react';
import type { Edge } from 'reactflow';

interface UseGraphEffectsProps {
  initialNodes: any[];
  initialEdges: Edge[];
  tempEdges: Edge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  setNodes: (nodes: any[]) => void;
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
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  useEffect(() => {
    setTempEdges(prev =>
      prev.filter(
        tempEdge =>
          !initialEdges.some(cacheEdge => cacheEdge.id === tempEdge.id)
      )
    );
  }, [initialEdges, setTempEdges]);

  useEffect(() => {
    setTempEdges(prev =>
      prev.map(edge => {
        const isRelatedToSelected = selectedNodeId
          ? selectedNodeId === edge.source || selectedNodeId === edge.target
          : false;

        return {
          ...edge,
          style: {
            strokeWidth: isRelatedToSelected ? 3 : 2,
            strokeDasharray: isRelatedToSelected ? '0' : '5,5',
            opacity: isRelatedToSelected ? 1 : 0.3,
            transition: 'opacity 0.2s ease-in-out',
          },
          data: {
            ...edge.data,
            isRelatedToSelected,
            isSelected: isRelatedToSelected,
          },
        };
      })
    );
  }, [hoveredNodeId, selectedNodeId, setTempEdges]);
};
