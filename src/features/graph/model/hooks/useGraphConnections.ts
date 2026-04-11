import { useCreateNoteLinkMutation } from '@/entities';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Connection, Edge, Node } from 'reactflow';
import type { GraphRetractLineState } from '../../lib/context/GraphContext';
import { graphTheme } from '../../lib/utils';

interface UseGraphConnectionsProps {
  layoutId: string;
  canEdit?: boolean;
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

const resolveSourceAnchor = (
  sourceNode: Node | undefined,
  startX: number,
  startY: number
) => {
  const width = (sourceNode?.width as number) || 100;
  const height = (sourceNode?.height as number) || 100;
  const left = sourceNode?.position.x ?? 0;
  const top = sourceNode?.position.y ?? 0;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  const dx = startX - centerX;
  const dy = startY - centerY;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? { x: left + width, y: centerY } : { x: left, y: centerY };
  }

  return dy >= 0 ? { x: centerX, y: top + height } : { x: centerX, y: top };
};

export const useGraphConnections = ({
  layoutId,
  canEdit = true,
  nodes,
  edges,
  screenToFlowPosition,
  onEdgeCreated,
}: UseGraphConnectionsProps) => {
  const palette = graphTheme();

  const [createNoteLink] = useCreateNoteLinkMutation();
  const [tempEdge, setTempEdge] = useState<Connection | null>(null);
  const [tempEdges, setTempEdges] = useState<Edge[]>([]);
  const [retractLine, setRetractLine] = useState<GraphRetractLineState | null>(
    null
  );
  const hasHandledConnectRef = useRef(false);

  const allEdges = useMemo(() => {
    return [...edges, ...tempEdges];
  }, [edges, tempEdges]);

  useEffect(() => {
    if (!retractLine) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        setRetractLine(prev => (prev?.id === retractLine.id ? null : prev));
      },
      (retractLine.durationMs ?? 180) + 40
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [retractLine]);

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
        palette.edge;

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
    [nodes, palette.edge]
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
      if (hasHandledConnectRef.current) {
        hasHandledConnectRef.current = false;
        setTempEdge(null);
        return;
      }

      if (!canEdit) {
        setTempEdge(null);
        return;
      }
      if (!tempEdge?.source || !isValidNoteId(tempEdge.source)) {
        setTempEdge(null);
        return;
      }

      const createRetract = (startX: number, startY: number) => {
        const sourceNode = nodes.find(node => node.id === tempEdge.source);
        const sourceAnchor = resolveSourceAnchor(sourceNode, startX, startY);
        const color =
          (sourceNode?.data as { layoutColor?: string } | undefined)
            ?.layoutColor || palette.edge;

        setRetractLine({
          id: `connect-retract-${Date.now()}-${tempEdge.source}`,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          startX,
          startY,
          color,
          durationMs: 180,
        });
      };

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
            const sourceId = tempEdge.source;

            if (sourceId === targetNodeId) {
              if (dropPosition) {
                createRetract(dropPosition.x, dropPosition.y);
              }
              setTempEdge(null);
              return;
            }

            const edgeExists = allEdges.some(
              edge => edge.source === sourceId && edge.target === targetNodeId
            );

            if (edgeExists) {
              if (dropPosition) {
                createRetract(dropPosition.x, dropPosition.y);
              }
              setTempEdge(null);
              return;
            }

            setTempEdge(null);

            try {
              const newEdge = createEdge(
                sourceId,
                targetNodeId,
                resolvedSourceHandle,
                targetHandleId
              );
              setTempEdges(prev => [...prev, newEdge]);

              await createNoteLink({
                layoutId,
                firstNoteId: sourceId,
                secondNoteId: targetNodeId,
              }).unwrap();

              setTempEdges(prev => prev.filter(edge => edge.id !== newEdge.id));
              try {
                onEdgeCreated?.(newEdge);
              } catch (error) {
                console.warn(
                  'Ignored non-critical edge created callback error',
                  error
                );
              }
            } catch (error) {
              setTempEdges(prev =>
                prev.filter(
                  edge =>
                    !edge.id.startsWith(`temp-${sourceId}-${targetNodeId}`)
                )
              );
              throw error;
            } finally {
              setTempEdge(null);
            }
          }
          return;
        }
      }
      if (!isValidNoteId(targetNodeId) || tempEdge.source === targetNodeId) {
        if (dropPosition) {
          createRetract(dropPosition.x, dropPosition.y);
        }
        setTempEdge(null);
        return;
      }
    },
    [
      layoutId,
      canEdit,
      createNoteLink,
      tempEdge,
      screenToFlowPosition,
      nodes,
      allEdges,
      createEdge,
      palette.edge,
    ]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!canEdit) return;
      if (
        !isValidNoteId(connection.source) ||
        !isValidNoteId(connection.target)
      ) {
        return;
      }

      const source = connection.source;
      const target = connection.target;

      if (source === target) {
        hasHandledConnectRef.current = true;
        setTempEdge(null);
        return;
      }

      hasHandledConnectRef.current = true;

      const edgeExists = allEdges.some(
        edge => edge.source === source && edge.target === target
      );

      if (edgeExists) {
        setTempEdge(null);
        return;
      }

      setTempEdge(null);

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
        } catch (error) {
          console.warn(
            'Ignored non-critical edge created callback error',
            error
          );
        }
      } catch (error) {
        setTempEdges(prev =>
          prev.filter(edge => !edge.id.startsWith(`temp-${source}-${target}`))
        );
        throw error;
      } finally {
        setTempEdge(null);
      }
    },
    [layoutId, canEdit, createNoteLink, allEdges, createEdge]
  );

  return {
    tempEdge,
    tempEdges,
    allEdges,
    retractLine,
    onConnectStart,
    onConnectEnd,
    onConnect,
    setTempEdges,
  };
};
