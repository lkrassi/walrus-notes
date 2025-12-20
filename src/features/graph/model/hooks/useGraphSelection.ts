import { useMemo } from 'react';
import type { Edge, Node } from 'reactflow';
type AnyEdge = Edge & {
  style?: { strokeWidth?: number; strokeDasharray?: string; opacity?: number };
  data?: {
    isRelatedToSelected?: boolean;
    isSelected?: boolean;
    [key: string]: unknown;
  };
};

type AnyNode = Node & {
  data?: {
    selected?: boolean;
    isRelatedToSelected?: boolean;
    onNoteClick?: (id: string) => void;
    [key: string]: unknown;
  };
  style?: { opacity?: number; [key: string]: unknown };
};

interface UseGraphSelectionProps {
  nodes: Node[];
  edges: Edge[];
  tempEdges: Edge[];
  selectedNodeId: string | null;
  hoveredNodeId?: string | null;
  allEdges: Edge[];
  onNoteOpen: (noteId: string) => void;
}

interface StyledEdge extends Omit<Edge, 'style' | 'data'> {
  style: {
    strokeWidth: number;
    strokeDasharray: string;
    opacity: number;
  };
  data: {
    isRelatedToSelected: boolean;
    isSelected: boolean;
    [key: string]: unknown;
  };
}

interface StyledNode extends Omit<Node, 'data' | 'style'> {
  data: {
    selected: boolean;
    isRelatedToSelected: boolean;
    onNoteClick: (noteId: string) => void;
    [key: string]: unknown;
  };
  style?: {
    opacity: number;
    transition?: string;
    [key: string]: unknown;
  };
}

export const useGraphSelection = ({
  nodes,
  edges,
  tempEdges,
  selectedNodeId,
  hoveredNodeId,
  allEdges,
  onNoteOpen,
}: UseGraphSelectionProps): {
  edgesWithSelection: StyledEdge[];
  nodesWithSelection: StyledNode[];
} => {
  const edgesWithSelection: StyledEdge[] = useMemo(() => {
    const combinedEdges = [...edges, ...tempEdges];

    const multiSelectedIds = new Set(
      nodes
        .filter(n => (n as unknown as { selected?: boolean }).selected)
        .map(n => n.id)
    );

    if (multiSelectedIds.size > 0) {
      return combinedEdges.map(edge => {
        const isRelated =
          multiSelectedIds.has(edge.source) ||
          multiSelectedIds.has(edge.target);
        const isSelected =
          multiSelectedIds.has(edge.source) &&
          multiSelectedIds.has(edge.target);
        const newStyle = {
          strokeWidth: isRelated ? 3 : 2,
          strokeDasharray: isSelected ? '0' : '5,5',
          opacity: isRelated ? 1 : 0.3,
        };
        const newData = {
          ...edge.data,
          isRelatedToSelected: isRelated,
          isSelected: isSelected,
        };

        const e = edge as AnyEdge;
        const styleChanged =
          e.style?.strokeWidth !== newStyle.strokeWidth ||
          e.style?.strokeDasharray !== newStyle.strokeDasharray ||
          e.style?.opacity !== newStyle.opacity;
        const dataChanged =
          e.data?.isRelatedToSelected !== newData.isRelatedToSelected ||
          e.data?.isSelected !== newData.isSelected;

        if (!styleChanged && !dataChanged) return edge as StyledEdge;

        return {
          ...edge,
          style: newStyle,
          data: newData,
        } as StyledEdge;
      });
    }

    const effectiveSelected = selectedNodeId ?? hoveredNodeId ?? null;

    if (!effectiveSelected) {
      return combinedEdges.map(edge => ({
        ...edge,
        style: {
          strokeWidth: 2,
          strokeDasharray: '5,5',
          opacity: 0.3,
        },
        data: {
          ...edge.data,
          isRelatedToSelected: false,
          isSelected: false,
        },
      })) as StyledEdge[];
    }

    return combinedEdges.map(edge => {
      const isRelated =
        effectiveSelected === edge.source || effectiveSelected === edge.target;

      const newStyle = isRelated
        ? { strokeWidth: 3, strokeDasharray: '0', opacity: 1 }
        : { strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.3 };

      const newData = {
        ...edge.data,
        isRelatedToSelected: !!isRelated,
        isSelected: !!isRelated,
      };

      const e = edge as AnyEdge;
      const styleChanged =
        e.style?.strokeWidth !== newStyle.strokeWidth ||
        e.style?.strokeDasharray !== newStyle.strokeDasharray ||
        e.style?.opacity !== newStyle.opacity;
      const dataChanged =
        e.data?.isRelatedToSelected !== newData.isRelatedToSelected ||
        e.data?.isSelected !== newData.isSelected;

      if (!styleChanged && !dataChanged) return edge as StyledEdge;

      return {
        ...edge,
        style: newStyle,
        data: newData,
      } as StyledEdge;
    });
  }, [edges, tempEdges, selectedNodeId, hoveredNodeId, nodes]);

  const nodesWithSelection: StyledNode[] = useMemo(() => {
    const multiSelectedIds = new Set(
      nodes
        .filter(n => (n as unknown as { selected?: boolean }).selected)
        .map(n => n.id)
    );

    if (multiSelectedIds.size > 0) {
      const relatedNodeIds = new Set<string>(Array.from(multiSelectedIds));
      allEdges.forEach(edge => {
        if (multiSelectedIds.has(edge.source)) relatedNodeIds.add(edge.target);
        if (multiSelectedIds.has(edge.target)) relatedNodeIds.add(edge.source);
      });

      return nodes.map(node => {
        const isRelated = relatedNodeIds.has(node.id);
        const isSelected = multiSelectedIds.has(node.id);

        const newData = {
          ...node.data,
          selected: isSelected,
          isRelatedToSelected: isRelated,
          onNoteClick: onNoteOpen,
        };
        const newStyle = {
          ...node.style,
          opacity: isRelated ? 1 : 0.5,
          transition: 'opacity 0.3s ease-in-out',
        };

        const n = node as AnyNode;
        const dataChanged =
          n.data?.selected !== newData.selected ||
          n.data?.isRelatedToSelected !== newData.isRelatedToSelected;
        const styleChanged = n.style?.opacity !== newStyle.opacity;

        if (!dataChanged && !styleChanged) return node as StyledNode;

        return {
          ...node,
          selected: isSelected,
          data: newData,
          style: newStyle,
        } as StyledNode;
      });
    }

    const effectiveSelected = selectedNodeId ?? hoveredNodeId ?? null;

    if (!effectiveSelected) {
      return nodes.map(node => {
        const newData = {
          ...node.data,
          selected: false,
          isRelatedToSelected: true,
          onNoteClick: onNoteOpen,
        };
        const newStyle = {
          ...node.style,
          opacity: 1,
        };
        const n = node as AnyNode;
        const dataChanged =
          n.data?.selected !== newData.selected ||
          n.data?.isRelatedToSelected !== newData.isRelatedToSelected;
        const styleChanged = n.style?.opacity !== newStyle.opacity;
        if (!dataChanged && !styleChanged) return node as StyledNode;
        return {
          ...node,
          selected: false,
          data: newData,
          style: newStyle,
        } as StyledNode;
      }) as StyledNode[];
    }

    const relatedNodeIds = new Set<string>([effectiveSelected]);
    allEdges.forEach(edge => {
      if (edge.source === effectiveSelected) relatedNodeIds.add(edge.target);
      if (edge.target === effectiveSelected) relatedNodeIds.add(edge.source);
    });

    return nodes.map(node => {
      const isRelated = relatedNodeIds.has(node.id);
      const isSelected = effectiveSelected === node.id;

      const newData = {
        ...node.data,
        selected: isSelected,
        isRelatedToSelected: isRelated,
        onNoteClick: onNoteOpen,
      };
      const newStyle = {
        ...node.style,
        opacity: isRelated ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out',
      };

      const n = node as AnyNode;
      const dataChanged =
        n.data?.selected !== newData.selected ||
        n.data?.isRelatedToSelected !== newData.isRelatedToSelected;
      const styleChanged = n.style?.opacity !== newStyle.opacity;

      if (!dataChanged && !styleChanged) return node as StyledNode;

      return {
        ...node,
        selected: isSelected,
        data: newData,
        style: newStyle,
      } as StyledNode;
    });
  }, [nodes, selectedNodeId, hoveredNodeId, allEdges, onNoteOpen]);

  return {
    edgesWithSelection,
    nodesWithSelection,
  };
};
