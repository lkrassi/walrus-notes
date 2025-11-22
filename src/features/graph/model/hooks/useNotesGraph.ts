import {
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
} from 'app/store/api';
import { useCallback, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import { generateColorFromId } from '../../model/utils/graphUtils';

interface UseNotesGraphProps {
  layoutId: string;
}

export const useNotesGraph = ({ layoutId }: UseNotesGraphProps) => {
  const { data: posedNotesResponse, isLoading } = useGetPosedNotesQuery({
    layoutId,
  });

  const [updatePosition] = useUpdateNotePositionMutation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const posedNotes = posedNotesResponse?.data || [];

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
        data: { note, nodeColor: generateColorFromId(note.id) },
      })),
    [notesWithPositions]
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
              const sourceColor = generateColorFromId(sourceNote.id);
              const targetColor = generateColorFromId(targetNoteId);

              const newEdge: Edge = {
                id: `edge-${sourceNote.id}-${targetNoteId}`,
                source: sourceNote.id,
                target: targetNoteId,
                type: 'multiColor' as const,
                data: {
                  sourceColor,
                  targetColor,
                },
              };

              edges.push(newEdge);
            }
          }
        });
      }
    });

    return edges;
  }, [notesWithPositions]);

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
