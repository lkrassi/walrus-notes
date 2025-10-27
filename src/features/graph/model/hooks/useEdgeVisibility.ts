import { useMemo } from 'react';
import type { Edge } from 'reactflow';

export const useEdgeVisibility = (
  edges: Edge[],
  selectedNodeId: string | null
) => {
  return useMemo(() => {
    if (!selectedNodeId) {
      return edges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          isRelatedToSelected: true,
          isSelected: false,
        },
      }));
    }

    const relatedNodeIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === selectedNodeId) relatedNodeIds.add(edge.target);
      if (edge.target === selectedNodeId) relatedNodeIds.add(edge.source);
    });
    relatedNodeIds.add(selectedNodeId);

    return edges.map(edge => {
      const isRelated =
        edge.source === selectedNodeId ||
        edge.target === selectedNodeId ||
        relatedNodeIds.has(edge.source) ||
        relatedNodeIds.has(edge.target);

      const isSelected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;

      return {
        ...edge,
        data: {
          ...edge.data,
          isRelatedToSelected: isRelated,
          isSelected,
        },
        style: {
          ...edge.style,
          opacity: isRelated ? 1 : 0.3,
          strokeWidth: isSelected ? 4 : isRelated ? 3 : 2,
        },
      };
    });
  }, [edges, selectedNodeId]);
};
