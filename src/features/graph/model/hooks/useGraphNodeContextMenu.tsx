import type { Note } from '@/entities/note';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { Node, ReactFlowProps } from 'reactflow';
import { GraphDeleteNoteForm } from '../../ui/components/GraphDeleteNoteForm';

type ContextMenuState = {
  x: number;
  y: number;
  note: Note;
} | null;

export const useGraphNodeContextMenu = ({
  onNoteOpenPinned,
  onPaneClick,
}: {
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
  onPaneClick?: ReactFlowProps['onPaneClick'];
}) => {
  const { t } = useTranslation();
  const { openModalFromTrigger } = useModalActions();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const onDocPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-graph-node-context-menu="true"]')) {
        return;
      }
      setContextMenu(null);
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', onDocPointerDown);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDocPointerDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [contextMenu]);

  const handleNodeContextMenu = useCallback((event: MouseEvent, node: Node) => {
    event.preventDefault();
    event.stopPropagation();

    const note = (node.data as { note?: Note } | undefined)?.note;
    if (!note) {
      setContextMenu(null);
      return;
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      note,
    });
  }, []);

  const handleOpenNoteFromMenu = useCallback(() => {
    if (!contextMenu) return;
    const noteData = { noteId: contextMenu.note.id, note: contextMenu.note };
    onNoteOpenPinned?.(noteData);
    setContextMenu(null);
  }, [contextMenu, onNoteOpenPinned]);

  const handleDeleteNoteFromMenu = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (!contextMenu) return;

      const note = contextMenu.note;
      openModalFromTrigger(
        <GraphDeleteNoteForm noteId={note.id} noteTitle={note.title} />,
        {
          title: t('notes:deleteNote'),
          size: MODAL_SIZE_PRESETS.noteDelete,
          showCloseButton: true,
        }
      )(event);

      setContextMenu(null);
    },
    [contextMenu, openModalFromTrigger, t]
  );

  const handlePaneClick = useCallback(
    (event: MouseEvent) => {
      setContextMenu(null);
      onPaneClick?.(event);
    },
    [onPaneClick]
  );

  return {
    contextMenu,
    handleNodeContextMenu,
    handleOpenNoteFromMenu,
    handleDeleteNoteFromMenu,
    handlePaneClick,
  };
};
