import { useDrafts } from '@/entities';
import type { Note } from '@/entities/note';
import { useCallback } from 'react';
import { useDraftSync } from './useDraftSync';
import { useNoteEditorState } from './useNoteEditorState';
import { useNoteNotifications } from './useNoteNotifications';
import { useNoteSave } from './useNoteSave';

export const useNoteEditor = (
  note: Note,
  canWrite: boolean,
  onNoteUpdated?: (note: Note) => void
) => {
  const isDraftDebug = import.meta.env.DEV;
  const { drafts } = useDrafts();
  const logDraft = useCallback(
    (message: string, extra?: Record<string, unknown>) => {
      if (!isDraftDebug) return;
      if (extra) {
        console.log(`[draft-flow][${note.id}] ${message}`, extra);
        return;
      }
      console.log(`[draft-flow][${note.id}] ${message}`);
    },
    [isDraftDebug, note.id]
  );

  const storeDraft = drafts[note.id] ?? null;

  const {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    payload,
    setPayload,
    setPayloadState,
    resetHydrationGuards,
    handleEdit,
    handleCancel,
    hasAnyDraftMarker,
    storedDraftText,
    serverDraft,
    originalPayload,
    ignoreDraftRef,
    suppressAutoEditUntilRef,
    lastLocalCommitRef,
    lastLocalUpdateRef,
    hydratedServerPayloadRef,
    hasLocalChanges,
  } = useNoteEditorState({
    note,
    canWrite,
    storeDraft,
    logDraft,
  });

  const {
    commitDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    sendUpdateDraft,
  } = useDraftSync({
    noteId: note.id,
    draft: payload,
    autoSyncEnabled: isEditing,
    initialPrevSent: originalPayload,
  });

  const { showError } = useNoteNotifications();

  const { isLoading, handleSave, handleDiscard } = useNoteSave({
    note,
    canWrite,
    title,
    setTitle,
    payload,
    setPayloadState,
    originalPayload,
    hasAnyDraftMarker,
    storedDraftText,
    serverDraft,
    isEditing,
    setIsEditing,
    ignoreDraftRef,
    suppressAutoEditUntilRef,
    lastLocalCommitRef,
    lastLocalUpdateRef,
    hydratedServerPayloadRef,
    commitDraft,
    sendUpdateDraft,
    onNoteUpdated,
    showError,
    logDraft,
  });

  return {
    isEditing,
    title,
    payload,
    isLoading,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    hasLocalChanges,
    hasServerDraft: hasAnyDraftMarker,
    setTitle,
    setPayload,
    setPayloadState,
    resetHydrationGuards,
    handleEdit,
    handleCancel,
    handleSave,
    handleDiscard,
    sendUpdateDraft,
  };
};
