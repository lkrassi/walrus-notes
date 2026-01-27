import { useEffect, useRef } from 'react';
import type { Edge, Node } from 'reactflow';

interface UseGraphInitializationProps {
  layoutId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useGraphInitialization = ({
  layoutId,
  initialNodes,
  initialEdges,
  nodes,
  edges,
  setNodes,
  setEdges,
}: UseGraphInitializationProps) => {
  const isProcessingRef = useRef(false);
  const isNodeDraggingRef = useRef(false);
  const prevLayoutIdRef = useRef(layoutId);

  useEffect(() => {
    const nodesStructuralEqual = () => {
      if (nodes.length !== initialNodes.length) return false;
      const map = new Map(nodes.map(n => [n.id, n]));
      for (const inNode of initialNodes) {
        const prev = map.get(inNode.id as string);
        if (!prev) return false;
        try {
          const prevColor =
            (prev.data as { layoutColor?: string } | undefined)?.layoutColor ??
            null;
          const newColor =
            (inNode.data as { layoutColor?: string } | undefined)
              ?.layoutColor ?? null;
          if (prevColor !== newColor) return false;
        } catch (_e) {}
      }
      return true;
    };

    const edgesStructuralEqual = () => {
      if (edges.length !== initialEdges.length) return false;
      const map = new Map(edges.map(e => [e.id, e]));
      for (const inEdge of initialEdges) {
        const prev = map.get(inEdge.id as string);
        if (!prev) return false;
        if (prev.source !== inEdge.source || prev.target !== inEdge.target)
          return false;
        if ((prev as Edge).sourceHandle !== (inEdge as Edge).sourceHandle)
          return false;
        if ((prev as Edge).targetHandle !== (inEdge as Edge).targetHandle)
          return false;
      }
      return true;
    };

    if (prevLayoutIdRef.current !== layoutId) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      prevLayoutIdRef.current = layoutId;
    } else {
      if (
        !isNodeDraggingRef.current &&
        !isProcessingRef.current &&
        !nodesStructuralEqual()
      ) {
        setNodes(initialNodes);
      }
      if (!edgesStructuralEqual()) {
        setEdges(initialEdges);
      }
    }
  }, [initialNodes, initialEdges, layoutId, setNodes, setEdges, nodes, edges]);

  return {
    isProcessingRef,
    isNodeDraggingRef,
    prevLayoutIdRef,
  };
};
