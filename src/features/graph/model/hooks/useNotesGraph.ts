import {
  getLayoutAccess,
  useGetMyLayoutsQuery,
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
} from '@/entities';
import type { Note } from '@/entities/note';
import { getLoadingState } from '@/shared/lib/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import { graphTheme } from '../../lib/utils';

interface UseNotesGraphProps {
  layoutId: string;
  isMain?: boolean;
}

export const useNotesGraph = ({ layoutId, isMain }: UseNotesGraphProps) => {
  const palette = graphTheme();

  const {
    data: posedNotesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetPosedNotesQuery(
    { layoutId },
    { refetchOnMountOrArgChange: isMain === true }
  );
  const { isInitialLoading, isRefreshing } = getLoadingState(
    isFetching,
    posedNotesResponse
  );

  const { data: layoutsResponse } = useGetMyLayoutsQuery();
  const layouts = layoutsResponse?.data || [];
  const currentLayout = layouts.find(l => l.id === layoutId);
  const canWrite = currentLayout
    ? getLayoutAccess(currentLayout).canWrite
    : true;
  const [updatePosition] = useUpdateNotePositionMutation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const posedNotes = posedNotesResponse?.data || [];

  useEffect(() => {
    if (isMain !== true) {
      return;
    }

    void refetch();
  }, [isMain, layoutId, refetch]);

  const layoutsMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of layouts) {
      if (l && l.id) m.set(l.id, l.color || palette.edge);
    }
    return m;
  }, [layouts, palette.edge]);

  const notesWithPositions = useMemo(
    () =>
      posedNotes.filter(
        (note: Note) =>
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
    notesWithPositions.forEach((sourceNote: Note) => {
      const outgoingLinks = Array.isArray(sourceNote.linkedWithOut)
        ? sourceNote.linkedWithOut
        : Array.isArray(
              (sourceNote as unknown as { linkedWith?: string[] })?.linkedWith
            )
          ? ((sourceNote as unknown as { linkedWith?: string[] })
              .linkedWith as string[])
          : [];

      outgoingLinks.forEach((targetNoteId: string) => {
        const targetNoteExists = notesWithPositions.some(
          (n: Note) => n.id === targetNoteId
        );

        if (targetNoteExists) {
          const edgeExists = edges.some(
            edge =>
              edge.source === sourceNote.id && edge.target === targetNoteId
          );

          if (!edgeExists) {
            const sourceColor =
              layoutsMap.get(sourceNote.layoutId || '') || palette.edge;

            const targetNote = notesWithPositions.find(
              (n: Note) => n.id === targetNoteId
            );
            const getReverseLinks = (note: Note | undefined): string[] => {
              if (Array.isArray(note?.linkedWithOut)) {
                return note!.linkedWithOut;
              }
              const legacyNote = note as unknown as { linkedWith?: string[] };
              if (Array.isArray(legacyNote?.linkedWith)) {
                return legacyNote.linkedWith;
              }
              return [];
            };
            const reverseLinkedOut = getReverseLinks(targetNote);
            const hasReverseLink = reverseLinkedOut.includes(sourceNote.id);
            const reverseColor = hasReverseLink
              ? layoutsMap.get(targetNote?.layoutId || '') || palette.edge
              : undefined;
            const newEdge: Edge = {
              id: `edge-${sourceNote.id}-${targetNoteId}`,
              source: sourceNote.id,
              target: targetNoteId,
              sourceHandle: (() => {
                try {
                  const target = notesWithPositions.find(
                    (n: Note) => n.id === targetNoteId
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
                    (n: Note) => n.id === targetNoteId
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
                isBidirectional: hasReverseLink,
                reverseEdgeColor: reverseColor,
              },
            };

            edges.push(newEdge);
          }
        }
      });
    });

    return edges;
  }, [notesWithPositions, layoutsMap, palette.edge]);

  const updatePositionCallback = useCallback(
    async (noteId: string, xPos: number, yPos: number) => {
      if (!canWrite) return;
      await updatePosition({
        layoutId,
        noteId,
        xPos,
        yPos,
      }).unwrap();
    },
    [layoutId, canWrite, updatePosition]
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
    isInitialLoading,
    isRefreshing,
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
