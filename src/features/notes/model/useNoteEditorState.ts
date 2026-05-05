import type { Note } from '@/entities/note';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseNoteEditorStateParams {
  note: Note;
  canWrite: boolean;
  storeDraft: string | null;
  logDraft: (message: string, extra?: Record<string, unknown>) => void;
}

export const useNoteEditorState = ({
  note,
  canWrite,
  storeDraft,
  logDraft,
}: UseNoteEditorStateParams) => {
  const [isEditing, setIsEditing] = useState(() => {
    if (!canWrite) {
      return false;
    }

    const initialServerDraft = note.draft?.trim() ?? '';
    const initialStoreDraft = storeDraft?.trim() ?? '';
    const initialHasServerDraft = initialServerDraft !== (note.payload ?? '');
    const initialHasStoreDraft = initialStoreDraft !== (note.payload ?? '');

    return initialHasServerDraft || initialHasStoreDraft;
  });
  const [title, setTitle] = useState<string>(note.title ?? '');

  const ignoreDraftRef = useRef(false);
  const suppressAutoEditUntilRef = useRef<number | null>(null);
  const lastLocalCommitRef = useRef<number | null>(null);
  const lastLocalUpdateRef = useRef<number | null>(null);
  const hydratedServerPayloadRef = useRef<string>(note.payload ?? '');

  const originalPayload = note.payload ?? '';
  const serverDraft = note.draft?.trim() ?? '';
  const storedDraftText = storeDraft?.trim() ?? '';

  const hasServerDraft = serverDraft !== (note.payload ?? '');
  const hasStoreDraft = storedDraftText !== (note.payload ?? '');
  const hasAnyDraftMarker = !!storedDraftText.length || !!serverDraft.length;

  let initialPayload = originalPayload;
  if (!ignoreDraftRef.current) {
    if (hasStoreDraft) {
      initialPayload = storedDraftText;
    } else if (hasServerDraft) {
      initialPayload = serverDraft;
    }
  }

  const [payload, setPayloadState] = useState<string>(initialPayload);

  const setPayload = (value: string | ((prev: string) => string)) => {
    try {
      lastLocalUpdateRef.current = Date.now();
      setPayloadState(prev => {
        const newValue = typeof value === 'function' ? value(prev) : value;
        return newValue;
      });
    } catch (error) {
      logDraft('setPayload failed', { error: String(error) });
    }
  };

  const handleEdit = () => {
    if (!canWrite) return;
    setIsEditing(true);
  };

  const resetHydrationGuards = () => {
    ignoreDraftRef.current = false;
    suppressAutoEditUntilRef.current = null;
    lastLocalUpdateRef.current = null;
  };

  const handleCancel = () => {
    setTitle(note.title ?? '');
    setIsEditing(false);
    return true;
  };

  useLayoutEffect(() => {
    setTitle(note.title ?? '');
    const incoming =
      !ignoreDraftRef.current && hasStoreDraft
        ? storedDraftText
        : !ignoreDraftRef.current && hasServerDraft
          ? serverDraft
          : note.payload;
    setPayloadState(prev => {
      const incomingSafe = incoming ?? '';
      hydratedServerPayloadRef.current = incomingSafe;
      try {
        if (
          lastLocalCommitRef.current != null &&
          Date.now() - lastLocalCommitRef.current < 5000 &&
          incomingSafe !== originalPayload
        ) {
          return prev;
        }
      } catch (error) {
        logDraft('hydrate guard check failed', { error: String(error) });
      }
      if (lastLocalUpdateRef.current == null) {
        return incomingSafe;
      }
      return prev;
    });

    logDraft('hydrate payload from note/store draft', {
      hasServerDraft,
      hasStoreDraft,
      notePayloadLength: (note.payload ?? '').length,
      noteDraftLength: (note.draft ?? '').length,
      storeDraftLength: (storeDraft ?? '').length,
    });
  }, [
    hasServerDraft,
    hasStoreDraft,
    note.id,
    note.title,
    note.payload,
    serverDraft,
    storeDraft,
    storedDraftText,
    originalPayload,
    logDraft,
  ]);

  useLayoutEffect(() => {
    try {
      if (!ignoreDraftRef.current && hasStoreDraft) {
        if (
          lastLocalUpdateRef.current != null &&
          Date.now() - lastLocalUpdateRef.current < 2000
        ) {
          return;
        }
        setPayloadState(storedDraftText);
      }
    } catch (error) {
      logDraft('sync store draft into payload failed', {
        error: String(error),
      });
    }
  }, [hasStoreDraft, note.id, storedDraftText]);

  useLayoutEffect(() => {
    if (!canWrite) {
      return;
    }

    if (ignoreDraftRef.current) {
      logDraft('skip force edit mode: ignoreDraftRef is active');
      return;
    }

    const suppressUntil = suppressAutoEditUntilRef.current;
    if (suppressUntil != null && Date.now() < suppressUntil) {
      logDraft('skip force edit mode: temporary suppression is active', {
        suppressUntil,
      });
      return;
    }

    if (hasStoreDraft || hasServerDraft) {
      logDraft('force edit mode because draft detected', {
        hasStoreDraft,
        hasServerDraft,
        notePayloadLength: (note.payload ?? '').length,
        noteDraftLength: (note.draft ?? '').length,
        storeDraftLength: (storeDraft ?? '').length,
      });
      setIsEditing(true);
      return;
    }

    if (suppressUntil != null) {
      suppressAutoEditUntilRef.current = null;
      logDraft('clear auto-edit suppression: draft markers are gone');
    }
  }, [canWrite, hasServerDraft, hasStoreDraft, note.id, logDraft]);

  useEffect(() => {
    ignoreDraftRef.current = false;
    logDraft('note context switched, reset ignoreDraftRef', {
      notePayloadLength: (note.payload ?? '').length,
      noteDraftLength: (note.draft ?? '').length,
      storeDraftLength: (storeDraft ?? '').length,
    });
  }, [note.id, logDraft]);

  return {
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
    hasServerDraft,
    hasAnyDraftMarker,
    storedDraftText,
    serverDraft,
    originalPayload,
    ignoreDraftRef,
    suppressAutoEditUntilRef,
    lastLocalCommitRef,
    lastLocalUpdateRef,
    hydratedServerPayloadRef,
    hasLocalChanges:
      lastLocalUpdateRef.current != null &&
      payload !== hydratedServerPayloadRef.current,
  } as const;
};
