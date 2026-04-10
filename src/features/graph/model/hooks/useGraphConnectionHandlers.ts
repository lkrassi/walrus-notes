import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from '@/entities';
import {
  createDeleteEdgeCommand,
  createMoveEdgeCommand,
  type useGraphHistory,
} from '@/entities/graph';
import { useCallback, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { Connection, Edge, Node } from 'reactflow';
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
  const palette = graphTheme();

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
      }>
    ) => {
      const { edgeId, source, target, newTarget } = event.detail;

      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      setIsDraggingEdge(false);

      try {
        if (newTarget) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            if (source === newTarget) {
              return;
            }

            const duplicateExists = [...edges, ...tempEdges].some(
              e =>
                e.id !== edgeId && e.source === source && e.target === newTarget
            );
            if (duplicateExists) {
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
                      // Ignore rollback network failures and keep original error.
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
      } catch (_error) {
      } finally {
        setEdgeDragSourceId(null);
        setEdgeDragOriginalTargetId(null);
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
      setIsDraggingEdge(true);
    },
    []
  );

  return {
    onConnect,
    handleEdgeDeleteDrop,
    handleEdgeDeleteStart,
    isDraggingEdge,
    edgeDragSourceId,
    edgeDragOriginalTargetId,
  };
};
