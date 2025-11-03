import { useMemo } from 'react';
import type { Edge, Node } from 'reactflow';

interface UseGraphSelectionProps {
  nodes: Node[];
  edges: Edge[];
  tempEdges: Edge[];
  selectedNodeId: string | null;
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
    [key: string]: any;
  };
}

interface StyledNode extends Omit<Node, 'data' | 'style'> {
  data: {
    selected: boolean;
    isRelatedToSelected: boolean;
    onNoteClick: (noteId: string) => void;
    [key: string]: any;
  };
  style?: {
    opacity: number;
    transition?: string;
    [key: string]: any;
  };
}

export const useGraphSelection = ({
  nodes,
  edges,
  tempEdges,
  selectedNodeId,
  allEdges,
  onNoteOpen,
}: UseGraphSelectionProps): {
  edgesWithSelection: StyledEdge[];
  nodesWithSelection: StyledNode[];
} => {
  const edgesWithSelection: StyledEdge[] = useMemo(() => {
    const combinedEdges = [...edges, ...tempEdges];

    if (!selectedNodeId) {
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
      const isOutgoingEdge = selectedNodeId === edge.source;

      if (isOutgoingEdge) {
        return {
          ...edge,
          style: {
            strokeWidth: 3,
            strokeDasharray: '0',
            opacity: 1,
          },
          data: {
            ...edge.data,
            isRelatedToSelected: true,
            isSelected: true,
          },
        } as StyledEdge;
      }

      return {
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
      } as StyledEdge;
    });
  }, [edges, tempEdges, selectedNodeId]);

  const nodesWithSelection: StyledNode[] = useMemo(() => {
    if (!selectedNodeId) {
      return nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          selected: false,
          isRelatedToSelected: true,
          onNoteClick: onNoteOpen,
        },
        style: {
          ...node.style,
          opacity: 1,
        },
      })) as StyledNode[];
    }

    const relatedNodeIds = new Set<string>([selectedNodeId]);
    allEdges.forEach(edge => {
      if (edge.source === selectedNodeId) relatedNodeIds.add(edge.target);
      if (edge.target === selectedNodeId) relatedNodeIds.add(edge.source);
    });

    return nodes.map(node => {
      const isRelated = relatedNodeIds.has(node.id);
      const isSelected = selectedNodeId === node.id;

      return {
        ...node,
        data: {
          ...node.data,
          selected: isSelected,
          isRelatedToSelected: isRelated,
          onNoteClick: onNoteOpen,
        },
        style: {
          ...node.style,
          opacity: isRelated ? 1 : 0.5,
          transition: 'opacity 0.3s ease-in-out',
        },
      } as StyledNode;
    });
  }, [nodes, selectedNodeId, allEdges, onNoteOpen]);

  return {
    edgesWithSelection,
    nodesWithSelection,
  };
};
