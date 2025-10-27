import { useCallback, useMemo, useState } from 'react';
import type { Connection, Edge } from 'reactflow';
import { useCreateNoteLinkMutation } from 'widgets/model/stores/api';
import { generateColorFromId } from '../../model/utils/graphUtils';

interface UseGraphConnectionsProps {
  layoutId: string;
  nodes: any[];
  edges: Edge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
}

const isValidNoteId = (id: string | null): id is string => {
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
  selectedNodeId,
  hoveredNodeId,
  screenToFlowPosition,
}: UseGraphConnectionsProps) => {
  const [createNoteLink] = useCreateNoteLinkMutation();
  const [tempEdge, setTempEdge] = useState<Connection | null>(null);
  const [tempEdges, setTempEdges] = useState<Edge[]>([]);

  const allEdges = useMemo(() => {
    return [...edges, ...tempEdges];
  }, [edges, tempEdges]);

  const createEdge = useCallback(
    (source: string, target: string): Edge => {
      return {
        id: `${source}-${target}`,
        source,
        target,
        type: 'multiColor' as const,
        data: {
          sourceColor: generateColorFromId(source),
          targetColor: generateColorFromId(target),
        },
        style: {
          strokeWidth: 3,
          strokeDasharray:
            selectedNodeId &&
            (selectedNodeId === source || selectedNodeId === target)
              ? '0'
              : '5,5',
          opacity:
            hoveredNodeId &&
            (hoveredNodeId === source || hoveredNodeId === target)
              ? 1
              : 0.7,
          transition: 'opacity 0.2s ease-in-out',
        },
        animated: false,
      };
    },
    [selectedNodeId, hoveredNodeId]
  );

  const onConnectStart = useCallback((event: any, params: any) => {
    if (!isValidNoteId(params.nodeId)) {
      return;
    }

    setTempEdge({
      source: params.nodeId,
      sourceHandle: params.handleId,
      target: null,
      targetHandle: null,
    });
  }, []);

  const onConnectEnd = useCallback(
    async (event: any) => {
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
          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = node.width || 100;
          const nodeHeight = node.height || 100;

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
        edge =>
          (edge.source === tempEdge.source && edge.target === targetNodeId) ||
          (edge.source === targetNodeId && edge.target === tempEdge.source)
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
      } catch (error) {
        setTempEdges(prev =>
          prev.filter(edge => edge.id !== `${tempEdge.source}-${targetNodeId}`)
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
        edge =>
          (edge.source === source && edge.target === target) ||
          (edge.source === target && edge.target === source)
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
      } catch (error) {
        setTempEdges(prev =>
          prev.filter(edge => edge.id !== `${source}-${target}`)
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
