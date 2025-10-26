import { useCallback, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import {
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
} from 'widgets/model/stores/api';
import { generateColorFromId } from '../../ui/components/NoteNode';

interface UseNotesGraphProps {
  layoutId: string;
}

// Используем тот же разделитель
const EDGE_ID_SEPARATOR = '___';

// Функция для создания edge ID
const createEdgeId = (source: string, target: string): string => {
  return `${source}${EDGE_ID_SEPARATOR}${target}`;
};

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
        data: { note },
      })),
    [notesWithPositions]
  );

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    notesWithPositions.forEach(note => {
      note.linkedWith?.forEach(linkedNoteId => {
        const targetNoteExists = notesWithPositions.some(
          n => n.id === linkedNoteId
        );

        if (targetNoteExists) {
          const edgeExists = edges.some(
            edge =>
              (edge.source === note.id && edge.target === linkedNoteId) ||
              (edge.source === linkedNoteId && edge.target === note.id)
          );

          if (!edgeExists) {
            const sourceColor = generateColorFromId(note.id);
            const targetColor = generateColorFromId(linkedNoteId);
            const isAnimated = !!(
              hoveredNodeId &&
              (hoveredNodeId === note.id || hoveredNodeId === linkedNoteId)
            );

            const newEdge: Edge = {
              id: createEdgeId(note.id, linkedNoteId),
              source: note.id,
              target: linkedNoteId,
              type: 'multiColor' as const,
              data: {
                sourceColor,
                targetColor,
              },
              style: {
                strokeWidth: 3,
                strokeDasharray:
                  selectedNodeId &&
                  (selectedNodeId === note.id ||
                    selectedNodeId === linkedNoteId)
                    ? '0'
                    : '5,5',
                opacity:
                  hoveredNodeId &&
                  (hoveredNodeId === note.id || hoveredNodeId === linkedNoteId)
                    ? 1
                    : 0.7,
              },
              animated: isAnimated,
            };
            edges.push(newEdge);
          }
        }
      });
    });

    return edges;
  }, [notesWithPositions, selectedNodeId, hoveredNodeId]);

  const updatePositionCallback = useCallback(
    async (noteId: string, xPos: number, yPos: number) => {
      try {
        await updatePosition({
          layoutId,
          noteId,
          xPos,
          yPos,
        }).unwrap();
      } catch (error) {
        console.error('Failed to update note position:', error);
      }
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
