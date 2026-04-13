import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from '@/entities';
import {
  createDeleteEdgeCommand,
  createMoveEdgeCommand,
  type EdgeDeleteHoverEventDetail,
  type useGraphHistory,
} from '@/entities/graph';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { Connection, Edge, Node } from 'reactflow';
import type { GraphRetractLineState } from '../../lib/context/GraphContext';
import { graphTheme } from '../../lib/utils';

type GraphHistory = ReturnType<typeof useGraphHistory>;

interface UseGraphConnectionHandlersProps {
  layoutId: string;
  nodes: Node[];
  edges: Edge[];
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  tempEdges: Edge[];
  setTempEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  graphHistory: GraphHistory;
  onConnectOriginal: (connection: Connection) => Promise<void>;
  isProcessingRef: RefObject<boolean>;
}

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

export const useGraphConnectionHandlers = ({
  layoutId,
  nodes,
  edges,
  setEdges,
  tempEdges,
  setTempEdges,
  graphHistory,
  onConnectOriginal,
  isProcessingRef,
}: UseGraphConnectionHandlersProps) => {
  const { t } = useTranslation('main');
  const [deleteNoteLink] = useDeleteNoteLinkMutation();
  const [createNoteLink] = useCreateNoteLinkMutation();
  const [isDraggingEdge, setIsDraggingEdge] = useState(false);
  const [edgeDragSourceId, setEdgeDragSourceId] = useState<string | null>(null);
  const [edgeDragOriginalTargetId, setEdgeDragOriginalTargetId] = useState<
    string | null
  >(null);
  const [edgeDragHoveredTargetId, setEdgeDragHoveredTargetId] = useState<
    string | null
  >(null);
  const [retractLine, setRetractLine] = useState<GraphRetractLineState | null>(
    null
  );
  const palette = graphTheme();

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

  const getNodeTitle = useCallback(
    (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      const title = (
        node?.data as { note?: { title?: string } } | undefined
      )?.note?.title?.trim();
      return title || nodeId;
    },
    [nodes]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      await onConnectOriginal(connection);
    },
    [onConnectOriginal]
  );

  const handleEdgeDeleteDrop = useCallback(
    async (
      event: CustomEvent<{
        edgeId: string;
        source: string;
        target: string;
        newTarget?: string | null;
        dropFlowX?: number;
        dropFlowY?: number;
      }>
    ) => {
      const { edgeId, source, target, newTarget } = event.detail;
      const { dropFlowX, dropFlowY } = event.detail;

      const emitRetract = () => {
        if (typeof dropFlowX !== 'number' || typeof dropFlowY !== 'number') {
          return;
        }

        const sourceNode = nodes.find(node => node.id === source);
        const sourceAnchor = resolveSourceAnchor(
          sourceNode,
          dropFlowX,
          dropFlowY
        );
        const color =
          (sourceNode?.data as { layoutColor?: string } | undefined)
            ?.layoutColor || palette.edge;

        setRetractLine({
          id: `edge-retract-${Date.now()}-${source}`,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          startX: dropFlowX,
          startY: dropFlowY,
          color,
          durationMs: 180,
        });
      };

      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      setIsDraggingEdge(false);

      try {
        if (newTarget) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            if (source === newTarget) {
              emitRetract();
              return;
            }

            const duplicateExists = [...edges, ...tempEdges].some(
              e =>
                e.id !== edgeId && e.source === source && e.target === newTarget
            );
            if (duplicateExists) {
              emitRetract();
              return;
            }

            const command = createMoveEdgeCommand({
              edgeId,
              source,
              oldTarget: target,
              newTarget,
              description: t('undoRedo.moveConnection', {
                sourceTitle: getNodeTitle(source),
                targetTitle: getNodeTitle(newTarget),
              }),
              onExecute: async (
                edgeId: string,
                source: string,
                oldTarget: string,
                newTarget: string
              ) => {
                const sourceNode = nodes.find(n => n.id === source);
                const edgeColor =
                  (sourceNode?.data as { layoutColor?: string })?.layoutColor ||
                  palette.edge;

                const optimisticEdge: Edge = {
                  id: `temp-move-${source}-${newTarget}-${Date.now()}`,
                  source,
                  target: newTarget,
                  type: 'multiColor' as const,
                  data: {
                    edgeColor,
                    optimisticReplaceEdgeId: edgeId,
                  },
                };

                setTempEdges(prev => [...prev, optimisticEdge]);

                let newLinkCreated = false;

                try {
                  await createNoteLink({
                    layoutId,
                    firstNoteId: source,
                    secondNoteId: newTarget,
                  }).unwrap();
                  newLinkCreated = true;

                  await deleteNoteLink({
                    layoutId,
                    firstNoteId: source,
                    secondNoteId: oldTarget,
                  }).unwrap();

                  setEdges(eds => {
                    const edgesWithoutMoved = eds.filter(
                      e => !(e.source === source && e.target === oldTarget)
                    );
                    const edgesWithoutDuplicates = edgesWithoutMoved.filter(
                      e => !(e.source === source && e.target === newTarget)
                    );

                    const newEdge: Edge = {
                      ...edge,
                      id: `edge-${source}-${newTarget}`,
                      source,
                      target: newTarget,
                      data: {
                        ...edge.data,
                        edgeColor,
                      },
                    };

                    return [...edgesWithoutDuplicates, newEdge];
                  });
                } catch (error) {
                  if (newLinkCreated) {
                    try {
                      await deleteNoteLink({
                        layoutId,
                        firstNoteId: source,
                        secondNoteId: newTarget,
                      }).unwrap();
                    } catch {
                      //ignore
                    }
                  }
                  throw error;
                } finally {
                  setTempEdges(prev =>
                    prev.filter(e => e.id !== optimisticEdge.id)
                  );
                }
              },
            });

            await graphHistory.executeCommand(command);
          }
        } else {
          emitRetract();
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            const command = createDeleteEdgeCommand({
              edge,
              description: t('undoRedo.disconnectConnection', {
                sourceTitle: getNodeTitle(source),
                targetTitle: getNodeTitle(target),
              }),
              onExecute: async (edgeId: string) => {
                await deleteNoteLink({
                  layoutId,
                  firstNoteId: source,
                  secondNoteId: target,
                });
                setEdges(eds => eds.filter(e => e.id !== edgeId));
              },
              onUndo: async (edge: Edge) => {
                await createNoteLink({
                  layoutId,
                  firstNoteId: edge.source,
                  secondNoteId: edge.target,
                });
                setEdges(prev => {
                  if (prev.some(e => e.id === edge.id)) return prev;
                  return [...prev, edge];
                });
              },
            });

            await graphHistory.executeCommand(command);
          }
        }
      } catch (e) {
        console.info(e);
      } finally {
        setEdgeDragSourceId(null);
        setEdgeDragOriginalTargetId(null);
        setEdgeDragHoveredTargetId(null);
        isProcessingRef.current = false;
      }
    },
    [
      layoutId,
      deleteNoteLink,
      createNoteLink,
      setEdges,
      tempEdges,
      setTempEdges,
      nodes,
      edges,
      graphHistory,
      isProcessingRef,
      palette.edge,
      getNodeTitle,
      t,
    ]
  );

  const handleEdgeDeleteStart = useCallback(
    (event: CustomEvent<{ source: string; target: string }>) => {
      setEdgeDragSourceId(event.detail.source);
      setEdgeDragOriginalTargetId(event.detail.target);
      setEdgeDragHoveredTargetId(null);
      setIsDraggingEdge(true);
    },
    []
  );

  const handleEdgeDeleteHover = useCallback(
    (event: CustomEvent<EdgeDeleteHoverEventDetail>) => {
      setEdgeDragHoveredTargetId(event.detail.hoveredTarget ?? null);
    },
    []
  );

  return {
    onConnect,
    handleEdgeDeleteDrop,
    handleEdgeDeleteStart,
    handleEdgeDeleteHover,
    isDraggingEdge,
    edgeDragSourceId,
    edgeDragOriginalTargetId,
    edgeDragHoveredTargetId,
    retractLine,
  };
};
