import {
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
  useGetMyLayoutsQuery,
} from 'app/store/api';
import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Edge, Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface UseNotesGraphProps {
  layoutId: string;
}

export const useNotesGraph = ({ layoutId }: UseNotesGraphProps) => {
  const {
    data: posedNotesResponse,
    isLoading,
    refetch,
  } = useGetPosedNotesQuery({ layoutId });

  const { data: layoutsResponse } = useGetMyLayoutsQuery();
  const layouts = layoutsResponse?.data || [];
  const isMain = layouts.find(l => l.id === layoutId)?.isMain === true;

  useEffect(() => {
    if (isMain) {
      refetch();
    }
  }, [isMain, layoutId, refetch]);

  const [updatePosition] = useUpdateNotePositionMutation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const posedNotes = posedNotesResponse?.data || [];

  const layoutsMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of layouts) {
      if (l && l.id) m.set(l.id, l.color || '#6b7280');
    }
    return m;
  }, [layouts]);

  const notesWithPositions = useMemo(
    () =>
      posedNotes.filter(
        note =>
          note.position?.xPos !== undefined && note.position?.yPos !== undefined
      ),
    [posedNotes]
  );

  const initialNodes: Node[] = useMemo(
    () =>
      notesWithPositions.map((note: Note) => ({
        id: note.id,
        type: 'note' as const,
        position: {
          x: note.position!.xPos,
          y: note.position!.yPos,
        },
        data: { note, layoutColor: layoutsMap.get(note.layoutId || '') },
      })),
    [notesWithPositions, layoutsMap]
  );

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    notesWithPositions.forEach(sourceNote => {
      if (sourceNote.linkedWith && Array.isArray(sourceNote.linkedWith)) {
        sourceNote.linkedWith.forEach(targetNoteId => {
          const targetNoteExists = notesWithPositions.some(
            n => n.id === targetNoteId
          );

          if (targetNoteExists) {
            const edgeExists = edges.some(
              edge =>
                edge.source === sourceNote.id && edge.target === targetNoteId
            );

            if (!edgeExists) {
              const sourceColor =
                layoutsMap.get(sourceNote.layoutId || '') || '#6b7280';
              const newEdge: Edge = {
                id: `edge-${sourceNote.id}-${targetNoteId}`,
                source: sourceNote.id,
                target: targetNoteId,
                sourceHandle: (() => {
                  try {
                    const target = notesWithPositions.find(
                      n => n.id === targetNoteId
                    )!;
                    const sx = sourceNote.position!.xPos;
                    const sy = sourceNote.position!.yPos;
                    const tx = target.position!.xPos;
                    const ty = target.position!.yPos;
                    const dx = tx - sx;
                    const dy = ty - sy;
                    if (Math.abs(dx) > Math.abs(dy)) {
                      return dx > 0 ? 'source-right' : 'source-left';
                    }
                    return dy > 0 ? 'source-bottom' : 'source-top';
                  } catch (_e) {
                    return undefined;
                  }
                })(),
                targetHandle: (() => {
                  try {
                    const target = notesWithPositions.find(
                      n => n.id === targetNoteId
                    )!;
                    const sx = sourceNote.position!.xPos;
                    const sy = sourceNote.position!.yPos;
                    const tx = target.position!.xPos;
                    const ty = target.position!.yPos;
                    const dx = tx - sx;
                    const dy = ty - sy;
                    if (Math.abs(dx) > Math.abs(dy)) {
                      return dx > 0 ? 'target-left' : 'target-right';
                    }
                    return dy > 0 ? 'target-top' : 'target-bottom';
                  } catch (_e) {
                    return undefined;
                  }
                })(),
                type: 'multiColor' as const,
                data: {
                  edgeColor: sourceColor,
                },
              };

              edges.push(newEdge);
            }
          }
        });
      }
    });

    return edges;
  }, [notesWithPositions, layoutsMap]);

  const updatePositionCallback = useCallback(
    async (noteId: string, xPos: number, yPos: number) => {
      try {
        await updatePosition({
          layoutId,
          noteId,
          xPos,
          yPos,
        }).unwrap();
      } catch (_error) {}
    },
    [layoutId, updatePosition]
  );

  const onNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => (prev === nodeId ? null : nodeId));
  }, []);

  const onNodeMouseEnter = useCallback((nodeId: string) => {
    setHoveredNodeId(nodeId);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return {
    isLoading,
    initialNodes,
    initialEdges,
    selectedNodeId,
    hoveredNodeId,
    updatePositionCallback,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneClick,
  };
};
