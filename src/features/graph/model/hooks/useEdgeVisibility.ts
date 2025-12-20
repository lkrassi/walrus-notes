import { useMemo } from 'react';
import type { Edge } from 'reactflow';

type AnyEdge = Edge & {
  style?: { opacity?: number; strokeWidth?: number; [key: string]: unknown };
  data?: {
    isRelatedToSelected?: boolean;
    isSelected?: boolean;
    [key: string]: unknown;
  };
};

export const useEdgeVisibility = (
  edges: Edge[],
  selectedNodeId: string | null
) => {
  return useMemo(() => {
    if (!selectedNodeId) {
      let changed = false;
      const mapped = edges.map(e => {
        const edge = e as AnyEdge;
        const newData = {
          ...(edge.data || {}),
          isRelatedToSelected: true,
          isSelected: false,
        };
        const newStyle = {
          ...(edge.style || {}),
          opacity: 1,
          strokeWidth: 2,
        };

        const dataChanged =
          edge.data?.isRelatedToSelected !== newData.isRelatedToSelected ||
          edge.data?.isSelected !== newData.isSelected;
        const styleChanged =
          edge.style?.opacity !== newStyle.opacity ||
          edge.style?.strokeWidth !== newStyle.strokeWidth;

        if (!dataChanged && !styleChanged) return e;
        changed = true;
        return { ...edge, data: newData, style: newStyle } as AnyEdge;
      });
      return changed ? mapped : edges;
    }

    const relatedNodeIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === selectedNodeId) relatedNodeIds.add(edge.target);
      if (edge.target === selectedNodeId) relatedNodeIds.add(edge.source);
    });
    relatedNodeIds.add(selectedNodeId);

    let changed = false;
    const mapped = edges.map(e => {
      const edge = e as AnyEdge;
      const isRelated =
        edge.source === selectedNodeId ||
        edge.target === selectedNodeId ||
        relatedNodeIds.has(edge.source) ||
        relatedNodeIds.has(edge.target);

      const isSelected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;

      const newData = {
        ...(edge.data || {}),
        isRelatedToSelected: isRelated,
        isSelected,
      };

      const newStyle = {
        ...(edge.style || {}),
        opacity: isRelated ? 1 : 0.3,
        strokeWidth: isSelected ? 4 : isRelated ? 3 : 2,
      };

      const dataChanged =
        edge.data?.isRelatedToSelected !== newData.isRelatedToSelected ||
        edge.data?.isSelected !== newData.isSelected;
      const styleChanged =
        edge.style?.opacity !== newStyle.opacity ||
        edge.style?.strokeWidth !== newStyle.strokeWidth;

      if (!dataChanged && !styleChanged) return e;
      changed = true;
      return { ...edge, data: newData, style: newStyle } as AnyEdge;
    });

    return changed ? mapped : edges;
  }, [edges, selectedNodeId]);
};
