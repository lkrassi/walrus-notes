import { useCreateNoteLinkMutation } from 'app/store/api';
import { useCallback, useMemo, useState } from 'react';
import type { Connection, Edge, Node } from 'reactflow';

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
    (
      source: string,
      target: string,
      sourceHandle?: string | null,
      targetHandle?: string | null
    ): Edge => {
      const sourceNode = nodes.find(n => n.id === source);
      const edgeColor =
        (sourceNode?.data as { layoutColor?: string })?.layoutColor ||
        '#6b7280';

      const edge: Edge = {
        id: `temp-${source}-${target}-${Date.now()}`,
        source,
        target,
        type: 'multiColor' as const,
        data: {
          edgeColor,
        },
      };

      const normalizeSource = (h?: string | null) => {
        if (!h) return undefined;
        if (h.startsWith('target-'))
          return `source-${h.slice('target-'.length)}`;
        return h;
      };

      const normalizeTarget = (h?: string | null) => {
        if (!h) return undefined;
        if (h.startsWith('source-'))
          return `target-${h.slice('source-'.length)}`;
        return h;
      };

      const sh = normalizeSource(sourceHandle);
      const th = normalizeTarget(targetHandle);
      if (sh) edge.sourceHandle = sh;
      if (th) edge.targetHandle = th;

      return edge;
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

      let dropPosition = null as { x: number; y: number } | null;

      let clientX: number | undefined;
      let clientY: number | undefined;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else if (
        event instanceof TouchEvent &&
        event.changedTouches.length > 0
      ) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } 

      if (clientX !== undefined && clientY !== undefined) {
        const flowPosition = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });
        dropPosition = flowPosition;

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
        if (targetNode && dropPosition) {
          const nodeX = targetNode.position.x as number;
          const nodeY = targetNode.position.y as number;
          const nodeWidth = (targetNode.width as number) || 100;
          const nodeHeight = (targetNode.height as number) || 100;
          const cx = nodeX + nodeWidth / 2;
          const cy = nodeY + nodeHeight / 2;
          const dx = dropPosition.x - cx;
          const dy = dropPosition.y - cy;
          const targetHandleId =
            Math.abs(dx) > Math.abs(dy)
              ? dx > 0
                ? 'target-right'
                : 'target-left'
              : dy > 0
                ? 'target-bottom'
                : 'target-top';

          let resolvedSourceHandle = tempEdge?.sourceHandle ?? null;
          if (!resolvedSourceHandle) {
            const sourceNode = nodes.find(n => n.id === tempEdge?.source);
            if (sourceNode && targetNode) {
              const sx =
                (sourceNode.position.x as number) +
                ((sourceNode.width as number) || 100) / 2;
              const sy =
                (sourceNode.position.y as number) +
                ((sourceNode.height as number) || 100) / 2;
              const tx = (targetNode.position.x as number) + nodeWidth / 2;
              const ty = (targetNode.position.y as number) + nodeHeight / 2;
              const ddx = tx - sx;
              const ddy = ty - sy;
              resolvedSourceHandle =
                Math.abs(ddx) > Math.abs(ddy)
                  ? ddx > 0
                    ? 'source-right'
                    : 'source-left'
                  : ddy > 0
                    ? 'source-bottom'
                    : 'source-top';
            }
          }

          if (isValidNoteId(targetNodeId) && tempEdge?.source) {
            const edgeExists = allEdges.some(
              edge =>
                edge.source === tempEdge.source && edge.target === targetNodeId
            );

            if (edgeExists) {
              setTempEdge(null);
              return;
            }

            try {
              const newEdge = createEdge(
                tempEdge.source,
                targetNodeId,
                resolvedSourceHandle,
                targetHandleId
              );
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
          }
          return;
        }
      }
      if (!isValidNoteId(targetNodeId) || tempEdge.source === targetNodeId) {
        setTempEdge(null);
        return;
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

      if (source === target) {
        return;
      }

      const edgeExists = allEdges.some(
        edge => edge.source === source && edge.target === target
      );

      if (edgeExists) {
        return;
      }

      try {
        const newEdge = createEdge(
          source,
          target,
          connection.sourceHandle ?? null,
          connection.targetHandle ?? null
        );
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
      } catch (_e) {
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
