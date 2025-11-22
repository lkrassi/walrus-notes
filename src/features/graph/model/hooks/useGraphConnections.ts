import { useCreateNoteLinkMutation } from 'app/store/api';
import { useCallback, useMemo, useState } from 'react';
import type { Connection, Edge, Node } from 'reactflow';
import { generateColorFromId } from '../../model/utils/graphUtils';

interface UseGraphConnectionsProps {
  layoutId: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  onEdgeCreated?: (edge: Edge) => void;
}

const isValidNoteId = (id: string | null | undefined): id is string => {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    id !== 'null' &&
    id !== 'undefined'
  );
};

export const useGraphConnections = ({
  layoutId,
  nodes,
  edges,
  screenToFlowPosition,
  onEdgeCreated,
}: UseGraphConnectionsProps) => {
  const [createNoteLink] = useCreateNoteLinkMutation();
  const [tempEdge, setTempEdge] = useState<Connection | null>(null);
  const [tempEdges, setTempEdges] = useState<Edge[]>([]);

  const allEdges = useMemo(() => {
    return [...edges, ...tempEdges];
  }, [edges, tempEdges]);

  const createEdge = useCallback(
    (source: string, target: string): Edge => {
      // try to reuse precomputed nodeColor from nodes data if available
      const sourceNode = nodes.find(n => n.id === source);
      const targetNode = nodes.find(n => n.id === target);
      const sourceColor =
        (sourceNode?.data as any)?.nodeColor || generateColorFromId(source);
      const targetColor =
        (targetNode?.data as any)?.nodeColor || generateColorFromId(target);

      return {
        id: `temp-${source}-${target}-${Date.now()}`,
        source,
        target,
        type: 'multiColor' as const,
        data: {
          sourceColor,
          targetColor,
        },
      };
    },
    [nodes]
  );

  const onConnectStart = useCallback(
    (
      _event: unknown,
      params: { nodeId: string | null; handleId?: string | null }
    ) => {
      if (!isValidNoteId(params.nodeId)) {
        return;
      }

      setTempEdge({
        source: params.nodeId,
        sourceHandle: params.handleId ?? null,
        target: null,
        targetHandle: null,
      });
    },
    []
  );

  const onConnectEnd = useCallback(
    async (event: unknown) => {
      if (!tempEdge?.source || !isValidNoteId(tempEdge.source)) {
        setTempEdge(null);
        return;
      }

      let targetNodeId: string | null = null;

      if (event instanceof MouseEvent) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const targetNode = nodes.find(node => {
          const nodeX = node.position.x as number;
          const nodeY = node.position.y as number;
          const nodeWidth = (node.width as number) || 100;
          const nodeHeight = (node.height as number) || 100;

          return (
            flowPosition.x >= nodeX &&
            flowPosition.x <= nodeX + nodeWidth &&
            flowPosition.y >= nodeY &&
            flowPosition.y <= nodeY + nodeHeight
          );
        });

        targetNodeId = targetNode?.id || null;
      }

      if (!isValidNoteId(targetNodeId) || tempEdge.source === targetNodeId) {
        setTempEdge(null);
        return;
      }

      const edgeExists = allEdges.some(
        edge => edge.source === tempEdge.source && edge.target === targetNodeId
      );

      if (edgeExists) {
        setTempEdge(null);
        return;
      }

      try {
        const newEdge = createEdge(tempEdge.source, targetNodeId);
        setTempEdges(prev => [...prev, newEdge]);

        await createNoteLink({
          layoutId,
          firstNoteId: tempEdge.source,
          secondNoteId: targetNodeId,
        }).unwrap();

        setTempEdges(prev => prev.filter(edge => edge.id !== newEdge.id));
        try {
          onEdgeCreated?.(newEdge);
        } catch (_e) {}
      } catch (_error) {
        setTempEdges(prev =>
          prev.filter(
            edge => edge.id !== `temp-${tempEdge.source}-${targetNodeId}`
          )
        );
      } finally {
        setTempEdge(null);
      }
    },
    [
      layoutId,
      createNoteLink,
      tempEdge,
      screenToFlowPosition,
      nodes,
      allEdges,
      createEdge,
    ]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (
        !isValidNoteId(connection.source) ||
        !isValidNoteId(connection.target)
      ) {
        return;
      }

      const source = connection.source;
      const target = connection.target;

      if (source === target) return;

      const edgeExists = allEdges.some(
        edge => edge.source === source && edge.target === target
      );

      if (edgeExists) return;

      try {
        const newEdge = createEdge(source, target);
        setTempEdges(prev => [...prev, newEdge]);

        await createNoteLink({
          layoutId,
          firstNoteId: source,
          secondNoteId: target,
        }).unwrap();

        setTempEdges(prev => prev.filter(edge => edge.id !== newEdge.id));
        try {
          onEdgeCreated?.(newEdge);
        } catch (_error) {}
      } catch (_error) {
        setTempEdges(prev =>
          prev.filter(edge => edge.id !== `temp-${source}-${target}`)
        );
      }
    },
    [layoutId, createNoteLink, allEdges, createEdge]
  );

  return {
    tempEdge,
    tempEdges,
    allEdges,
    onConnectStart,
    onConnectEnd,
    onConnect,
    setTempEdges,
  };
};
