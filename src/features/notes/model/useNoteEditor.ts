import type { Note } from '@/entities/note';
import { useSelector } from 'react-redux';
import { useDraftSync } from './useDraftSync';
import { useNoteEditorState } from './useNoteEditorState';
import { useNoteNotifications } from './useNoteNotifications';
import { useNoteSave } from './useNoteSave';

type RootStateLike = {
  drafts?: Record<string, string>;
  user: {
    profile?: {
      id?: string;
    } | null;
  };
};

export const useNoteEditor = (
  note: Note,
  canWrite: boolean,
  onNoteUpdated?: (note: Note) => void
) => {
  const isDraftDebug = import.meta.env.DEV;
  const logDraft = (message: string, extra?: Record<string, unknown>) => {
    if (!isDraftDebug) return;
    if (extra) {
      console.log(`[draft-flow][${note.id}] ${message}`, extra);
      return;
    }
    console.log(`[draft-flow][${note.id}] ${message}`);
  };

  const storeDraft = useSelector(
    (s: RootStateLike) => s.drafts?.[note.id] ?? null
  );
  const userId = useSelector((s: RootStateLike) => s.user.profile?.id ?? '');

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
    userId,
    draft: payload,
  });

  const { isRecordNotFound422, showError } = useNoteNotifications();

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
    isRecordNotFound422,
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
    hasServerDraft: !!(
      note.draft &&
      note.draft.length &&
      note.draft !== note.payload
    ),
    setTitle,
    setPayload,
    handleEdit,
    handleCancel,
    handleSave,
    handleDiscard,
    sendUpdateDraft,
  };
};
