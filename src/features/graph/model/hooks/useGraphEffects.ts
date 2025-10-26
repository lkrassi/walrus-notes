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
        const isAnimated = !!(
          hoveredNodeId &&
          (hoveredNodeId === edge.source || hoveredNodeId === edge.target)
        );

        return {
          ...edge,
          animated: isAnimated,
          style: {
            ...edge.style,
            opacity:
              hoveredNodeId &&
              (hoveredNodeId === edge.source || hoveredNodeId === edge.target)
                ? 1
                : 0.7,
          },
        };
      })
    );
  }, [hoveredNodeId, setTempEdges]);

  useEffect(() => {
    setTempEdges(prev =>
      prev.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          strokeDasharray:
            selectedNodeId &&
            (selectedNodeId === edge.source || selectedNodeId === edge.target)
              ? '0'
              : '5,5',
        },
      }))
    );
  }, [selectedNodeId, setTempEdges]);
};
