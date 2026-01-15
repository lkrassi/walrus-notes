import { useCallback, useEffect } from 'react';
import type { Node } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface UseGraphSyncHandlersProps {
  nodes: Node[];
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  isDraggingEdge?: boolean;
}

/**
 * Управляет операциями синхронизации с пользовательским интерфейсом.
 *
 * Обрабатывает:
 * - handleNoteOpen: Открытие заметки при клике
 * - Cleanup для prevent memory leaks
 *
 * Интегрирует с внешними event handlers (из useGraphHandlers, useGraphConnections)
 */
export const useGraphSyncHandlers = ({
  nodes,
  onNoteOpen,
  isDraggingEdge,
}: UseGraphSyncHandlersProps) => {
  // Открытие заметки
  const handleNoteOpen = useCallback(
    (noteId: string) => {
      const node = nodes.find(n => n.id === noteId) as
        | Node<{ note?: Note; layoutColor?: string }>
        | undefined;
      const note = node ? (node.data as { note?: Note })?.note : undefined;
      if (note) {
        onNoteOpen?.({ noteId, note });
      }
    },
    [nodes, onNoteOpen]
  );

  // Cleanup при unmount или изменении isDraggingEdge
  useEffect(() => {
    return () => {
      // Cleanup logic if needed
    };
  }, [isDraggingEdge]);

  return {
    handleNoteOpen,
  };
};
