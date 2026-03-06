import { useCallback, useEffect } from 'react';
import { makeCommitDraft } from '@/shared/model/ws';
import { useAppDispatch, useAppSelector } from '@/widgets/hooks/redux';
import { useDebounced } from '@/widgets/hooks/useDebounced';
import { useWebSocket } from '@/widgets/hooks/useWebSocket';
import { useWSContext } from '@/widgets/providers/WebSocketProvider';
import type { UseDraftSyncOpts, UseDraftSyncReturn } from './types';
import { useDraftListeners } from './useDraftListeners';
import { useDraftSender } from './useDraftSender';
import { useDraftState } from './useDraftState';

export const useDraftSync = ({
  noteId,
  userId,
  serverUrl = '/wn/api/connection',
  draft,
  debounceMs = 800,
  onRemoteDraft,
  onRemoteCommit,
}: UseDraftSyncOpts): UseDraftSyncReturn => {
  const debounced = useDebounced(draft, debounceMs);
  const ctx = useWSContext();
  const ws = ctx ?? useWebSocket({ url: serverUrl, userId });
  const dispatch = useAppDispatch();
  const storedDraft = useAppSelector(state =>
    noteId ? (state.drafts?.[noteId] ?? null) : null
  );

  const {
    isSaving,
    setIsSaving,
    lastSavedAt,
    setLastSavedAt,
    lastCommitAt,
    setLastCommitAt,
    refs,
  } = useDraftState(draft);

  useEffect(() => {
    if (!noteId) return;

    refs.skipInitialSendRef.current = true;

    try {
      if (storedDraft != null) {
        refs.pendingRef.current = storedDraft;
      }
      try {
        refs.initialPayloadRef.current = refs.draftRef.current ?? null;
      } catch (_e) {
        refs.initialPayloadRef.current = null;
      }
    } catch (_e) {}

    return () => {};
  }, [noteId, refs]);

  const send = useDraftSender({
    noteId,
    ws,
    refs,
    lastCommitAt,
    dispatch,
    setIsSaving,
  });

  useDraftListeners({
    ws,
    noteId,
    refs,
    lastCommitAt,
    dispatch,
    setIsSaving,
    setLastSavedAt,
    setLastCommitAt,
    onRemoteDraft,
    onRemoteCommit,
  });

  useEffect(() => {
    if (!noteId) return;

    if (refs.skipInitialSendRef.current) {
      refs.skipInitialSendRef.current = false;
      return;
    }

    try {
      if (
        refs.initialPayloadRef.current != null &&
        refs.prevSentRef.current == null &&
        debounced === refs.initialPayloadRef.current
      ) {
        return;
      }
    } catch (_e) {}

    if (
      refs.lastManualSendAtRef.current != null &&
      Date.now() - refs.lastManualSendAtRef.current < debounceMs + 200
    ) {
      refs.lastManualSendAtRef.current = null;
      return;
    }

    if (
      refs.lastManualSendAtRef.current != null &&
      Date.now() - refs.lastManualSendAtRef.current < debounceMs + 200
    ) {
      refs.lastManualSendAtRef.current = null;
      return;
    }

    if (debounced === refs.prevSentRef.current) {
      return;
    }

    if (
      !debounced &&
      refs.draftRef.current &&
      refs.draftRef.current.trim().length > 0
    ) {
      return;
    }

    send(debounced);
  }, [debounced, noteId, send, debounceMs, refs]);

  const commitDraft = useCallback(
    (value?: string) => {
      if (!noteId || !ws) {
        return false;
      }

      try {
        refs.awaitingCommitRef.current = true;

        try {
          refs.suppressRemoteUntilRef.current = Date.now() + 3500;
        } catch (_e) {}

        try {
          refs.lastManualSendAtRef.current = Date.now();
        } catch (_e) {}

        try {
          refs.awaitingCommitPayloadRef.current =
            value ?? refs.draftRef.current ?? null;
          if (refs.awaitingCommitPayloadRef.current != null)
            refs.prevSentRef.current = refs.awaitingCommitPayloadRef.current;
        } catch (_e) {
          refs.awaitingCommitPayloadRef.current = null;
        }

        ws.send(makeCommitDraft(noteId));
        return true;
      } catch (_e) {
        return false;
      }
    },
    [noteId, ws, refs]
  );

  const sendUpdateDraft = useCallback(
    (value: string) => {
      if (!noteId) {
        return false;
      }

      try {
        refs.lastManualSendAtRef.current = Date.now();
      } catch (_e) {}

      return send(value);
    },
    [noteId, send, refs]
  );

  return {
    commitDraft,
    isConnected: !!ws?.isConnected,
    isSaving,
    isPending: !!refs.pendingRef.current,
    isSynced:
      (refs.prevSentRef.current === draft && refs.pendingRef.current == null) ||
      (!!lastCommitAt &&
        refs.lastEditAtRef.current != null &&
        lastCommitAt >= refs.lastEditAtRef.current &&
        refs.pendingRef.current == null),
    lastSavedAt,
    sendRaw: ws?.send ?? (() => false),
    subscribe: ws?.subscribe ?? (() => () => {}),
    sendUpdateDraft,
  } as const;
};

export type { UseDraftSyncOpts, UseDraftSyncReturn } from './types';
