import { useDrafts } from '@/entities';
import type { Note } from '@/entities/note';
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
  const logDraft = (message: string, extra?: Record<string, unknown>) => {
    if (!isDraftDebug) return;
    if (extra) {
      console.log(`[draft-flow][${note.id}] ${message}`, extra);
      return;
    }
    console.log(`[draft-flow][${note.id}] ${message}`);
  };

  const storeDraft = drafts[note.id] ?? null;

  const {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    payload,
    setPayload,
    setPayloadState,
    handleEdit,
    handleCancel,
    hasAnyDraftMarker,
    storedDraftText,
    serverDraft,
    originalPayload,
    ignoreDraftRef,
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
    handleEdit,
    handleCancel,
    handleSave,
    handleDiscard,
    sendUpdateDraft,
  };
};
