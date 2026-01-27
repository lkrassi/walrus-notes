import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from 'app/store/api';
import { useCallback, useState } from 'react';
import type { Connection, Edge, Node } from 'reactflow';
import {
  CreateEdgeCommand,
  DeleteEdgeCommand,
  MoveEdgeCommand,
} from '../commands';
import type { useGraphHistory } from './useGraphHistory';

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
  isProcessingRef: React.MutableRefObject<boolean>;
}

export const useGraphConnectionHandlers = ({
  layoutId,
  nodes,
  edges,
  setEdges,
  tempEdges: _tempEdges,
  setTempEdges: _setTempEdges,
  graphHistory,
  onConnectOriginal,
  isProcessingRef,
}: UseGraphConnectionHandlersProps) => {
  const [deleteNoteLink] = useDeleteNoteLinkMutation();
  const [createNoteLink] = useCreateNoteLinkMutation();
  const [isDraggingEdge, setIsDraggingEdge] = useState(false);

  const onConnect = useCallback(
    async (connection: Connection) => {
      const source = connection.source ?? '';
      const target = connection.target ?? '';
      if (!source || !target) return;
      const newEdge = {
        id: `edge-${source}-${target}`,
        source: source,
        target: target,
        type: 'multiColor' as const,
        data: {
          edgeColor: '#6b7280',
        },
      };

      const command = new CreateEdgeCommand(
        newEdge,
        async (edge: Edge) => {
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
        async (edgeId: string) => {
          const edge = edges.find(e => e.id === edgeId);
          if (!edge) return;
          await deleteNoteLink({
            layoutId,
            firstNoteId: edge.source,
            secondNoteId: edge.target,
          });
          setEdges(prev => prev.filter(e => e.id !== edgeId));
        }
      );

      await graphHistory.executeCommand(command);
      await onConnectOriginal(connection);
    },
    [
      layoutId,
      createNoteLink,
      deleteNoteLink,
      edges,
      setEdges,
      onConnectOriginal,
      graphHistory,
    ]
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
            const command = new MoveEdgeCommand(
              edgeId,
              source,
              target,
              newTarget,
              async (
                edgeId: string,
                source: string,
                oldTarget: string,
                newTarget: string
              ) => {
                await deleteNoteLink({
                  layoutId,
                  firstNoteId: source,
                  secondNoteId: oldTarget,
                });
                await createNoteLink({
                  layoutId,
                  firstNoteId: source,
                  secondNoteId: newTarget,
                });

                setEdges(eds => {
                  const filteredEdges = eds.filter(e => e.id !== edgeId);
                  const edgesWithoutNewTarget = filteredEdges.filter(
                    e => !(e.source === source && e.target === newTarget)
                  );

                  const sourceNode = nodes.find(n => n.id === source);
                  const edgeColor =
                    (sourceNode?.data as { layoutColor?: string })
                      ?.layoutColor || '#6b7280';

                  const newEdge = {
                    id: `edge-${source}-${newTarget}`,
                    source,
                    target: newTarget,
                    type: 'multiColor' as const,
                    data: {
                      edgeColor,
                    },
                  };

                  return [...edgesWithoutNewTarget, newEdge];
                });
              }
            );

            await graphHistory.executeCommand(command);
          }
        } else {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            const command = new DeleteEdgeCommand(
              edge,
              async (edgeId: string) => {
                await deleteNoteLink({
                  layoutId,
                  firstNoteId: source,
                  secondNoteId: target,
                });
                setEdges(eds => eds.filter(e => e.id !== edgeId));
              },
              async (edge: Edge) => {
                await createNoteLink({
                  layoutId,
                  firstNoteId: edge.source,
                  secondNoteId: edge.target,
                });
                setEdges(prev => {
                  if (prev.some(e => e.id === edge.id)) return prev;
                  return [...prev, edge];
                });
              }
            );

            await graphHistory.executeCommand(command);
          }
        }
      } catch (_error) {
      } finally {
        isProcessingRef.current = false;
      }
    },
    [
      layoutId,
      deleteNoteLink,
      createNoteLink,
      setEdges,
      nodes,
      edges,
      graphHistory,
      isProcessingRef,
    ]
  );

  const handleEdgeDeleteStart = useCallback(() => {
    setIsDraggingEdge(true);
  }, []);

  return {
    onConnect,
    handleEdgeDeleteDrop,
    handleEdgeDeleteStart,
    isDraggingEdge,
  };
};
