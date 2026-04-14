import { useUser } from '@/entities';
import type { Note } from '@/entities/note';
import type { AwarenessUser } from '@/shared/lib/react/collaboration';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useExportNote } from '../lib/hooks';
import type { CollaborativeNoteEditorHandle } from '../ui/components/CollaborativeNoteEditor';
import { useNoteEditor } from './useNoteEditor';

interface UseNoteViewerStateParams {
  note: Note;
  canWrite: boolean;
  onNoteUpdated?: (note: Note) => void;
}

export const useNoteViewerState = ({
  note,
  canWrite,
  onNoteUpdated,
}: UseNoteViewerStateParams) => {
  const {
    isEditing,
    title,
    payload,
    isLoading,
    setPayload,
    handleEdit,
    handleCancel,
    handleSave,
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    handleDiscard,
  } = useNoteEditor(note, canWrite, onNoteUpdated);

  const { exportNote } = useExportNote();
  const collaborativeEditorRef = useRef<CollaborativeNoteEditorHandle>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );

  const { userId: currentUserId } = useUser();

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleInsertImage = useCallback(
    (url: string) => {
      const alt = 'image';
      const snippet = `![${alt}](${url})`;

      if (collaborativeEditorRef.current) {
        collaborativeEditorRef.current.insertText(snippet);
      } else {
        setPayload(prev =>
          prev && prev.trim().length > 0 ? `${prev}\n\n${snippet}` : snippet
        );
      }
    },
    [setPayload]
  );

  const handleExport = useCallback(() => {
    exportNote(title, payload);
  }, [exportNote, payload, title]);

  const handleImport = useCallback(
    (content: string) => {
      if (!canWrite) return;
      setPayload(() => content);
    },
    [canWrite, setPayload]
  );

  const handleSaveAction = useCallback(
    (overrideTitle?: string) => {
      void handleSave(overrideTitle);
    },
    [handleSave]
  );

  const handleCancelAction = useCallback(() => {
    void handleCancel();
  }, [handleCancel]);

  const handleDiscardAction = useCallback(() => {
    void (async () => {
      const discarded = await handleDiscard();
      if (!discarded) {
        return;
      }

      const ytext = collaborativeEditorRef.current?.ytext;
      if (!ytext) {
        return;
      }

      try {
        const persistedPayload = note.payload ?? '';
        ytext.doc?.transact(() => {
          if (ytext.length > 0) {
            ytext.delete(0, ytext.length);
          }

          if (persistedPayload.length > 0) {
            ytext.insert(0, persistedPayload);
          }
        }, 'discard-reset');
      } catch {
        // Ignore Yjs reset errors: local payload is already restored by handleDiscard.
      }
    })();
  }, [collaborativeEditorRef, handleDiscard, note.payload]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 's' &&
        !event.shiftKey &&
        !event.altKey;

      if (!isSaveShortcut) {
        return;
      }

      event.preventDefault();
      void handleSave();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleSave, isEditing]);

  return {
    noteId: note.id,
    isEditing,
    title,
    payload,
    isLoading,
    setPayload,
    handleEdit,
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    isFullscreen,
    onlineUsers,
    currentUserId,
    collaborativeEditorRef,
    setOnlineUsers,
    toggleFullscreen,
    handleInsertImage,
    handleExport,
    handleImport,
    handleSaveAction,
    handleCancelAction,
    handleDiscardAction,
  };
};
