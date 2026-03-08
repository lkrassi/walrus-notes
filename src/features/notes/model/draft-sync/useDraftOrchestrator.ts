import { makeCommitDraft } from '@/entities';
import { useDebounced } from '@/shared/lib/react/hooks';
import { useCallback, useEffect, useRef } from 'react';
import { createDraftWsSnapshot, logDraftWs } from './log';
import type { UseDraftSyncDeps, UseDraftSyncReturn } from './types';
import { useDraftListeners } from './useDraftListeners';
import { useDraftSender } from './useDraftSender';
import { useDraftState } from './useDraftState';

type UseDraftOrchestratorOpts = UseDraftSyncDeps & {
  noteId: string | null | undefined;
  draft: string;
  debounceMs?: number;
  onRemoteDraft?: (newDraft: string) => void;
  onRemoteCommit?: () => void;
};

export const useDraftOrchestrator = ({
  noteId,
  draft,
  debounceMs = 800,
  onRemoteDraft,
  onRemoteCommit,
  ws,
  storedDraft,
  layouts,
  dispatch,
}: UseDraftOrchestratorOpts): UseDraftSyncReturn => {
  const debounced = useDebounced(draft, debounceMs);

  const {
    draftPhase,
    setDraftPhase,
    isSaving,
    setIsSaving,
    lastSavedAt,
    setLastSavedAt,
    lastCommitAt,
    setLastCommitAt,
    refs,
  } = useDraftState(draft);
  const prevDraftRef = useRef(draft);

  const clearCommitRetryTimer = useCallback(() => {
    const timer = refs.commitRetryTimerRef.current;
    if (timer != null) {
      clearTimeout(timer);
      refs.commitRetryTimerRef.current = null;
    }
  }, [refs]);

  const scheduleCommitRetry = useCallback(
    (reason: string) => {
      if (!noteId || !ws) {
        return;
      }

      const pendingPayload =
        refs.pendingCommitPayloadRef.current ??
        refs.awaitingCommitPayloadRef.current ??
        refs.draftRef.current ??
        null;

      if (pendingPayload == null) {
        return;
      }

      if (refs.commitRetryTimerRef.current != null) {
        return;
      }

      refs.pendingCommitPayloadRef.current = pendingPayload;

      const attempt = refs.commitRetryCountRef.current + 1;
      refs.commitRetryCountRef.current = attempt;
      const delay = Math.min(
        30_000,
        1000 * Math.pow(2, Math.max(0, attempt - 1))
      );

      logDraftWs(
        'STATE',
        'COMMIT_RETRY_SCHEDULED',
        { noteId, reason, attempt, delayMs: delay },
        createDraftWsSnapshot(refs, {
          noteId,
          draftPhase,
          reason,
          isConnected: !!ws?.isConnected,
        })
      );

      refs.commitRetryTimerRef.current = setTimeout(() => {
        refs.commitRetryTimerRef.current = null;

        if (!noteId || !ws) {
          return;
        }

        const latestPayload =
          refs.pendingCommitPayloadRef.current ??
          refs.awaitingCommitPayloadRef.current ??
          null;

        if (latestPayload == null) {
          return;
        }

        refs.awaitingCommitRef.current = true;
        refs.awaitingCommitPayloadRef.current = latestPayload;

        const ok = ws.send(makeCommitDraft(noteId));
        logDraftWs(
          ok ? 'RECONNECT' : 'STATE',
          'COMMIT_DRAFT_REQUEST',
          {
            noteId,
            reason: 'retry-timer',
            attempt: refs.commitRetryCountRef.current,
            status: ok ? 'resent' : 'retry-failed',
          },
          createDraftWsSnapshot(refs, {
            noteId,
            draftPhase,
            reason: 'retry-timer',
            isConnected: !!ws?.isConnected,
          })
        );

        if (ok) {
          refs.pendingCommitPayloadRef.current = null;
          setDraftPhase('COMMITTING');
          return;
        }

        scheduleCommitRetry('retry-send-failed');
      }, delay);
    },
    [draftPhase, noteId, refs, setDraftPhase, ws]
  );

  const resetCommitRetryState = useCallback(() => {
    clearCommitRetryTimer();
    refs.commitRetryCountRef.current = 0;
  }, [clearCommitRetryTimer, refs]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    if (prevDraftRef.current !== draft) {
      prevDraftRef.current = draft;
      setDraftPhase('EDITING');
    }
  }, [draft, noteId, setDraftPhase]);

  useEffect(() => {
    if (!ws || !noteId) {
      return;
    }

    const unsubscribe = ws.onOpen?.(() => {
      const pendingCommit = refs.pendingCommitPayloadRef.current;
      if (pendingCommit == null) {
        return;
      }

      const ok = ws.send(makeCommitDraft(noteId));
      logDraftWs('RECONNECT', 'COMMIT_DRAFT_REQUEST', {
        noteId,
        attempt: refs.commitRetryCountRef.current,
        status: ok ? 'resent' : 'failed',
      });

      if (ok) {
        refs.awaitingCommitRef.current = true;
        refs.awaitingCommitPayloadRef.current = pendingCommit;
        refs.pendingCommitPayloadRef.current = null;
        setDraftPhase('COMMITTING');
      } else {
        scheduleCommitRetry('on-open-send-failed');
      }
    });

    return () => {
      try {
        if (unsubscribe) unsubscribe();
      } catch (_e) {}
    };
  }, [noteId, refs, scheduleCommitRetry, setDraftPhase, ws]);

  useEffect(() => {
    return () => {
      clearCommitRetryTimer();
    };
  }, [clearCommitRetryTimer]);

  useEffect(() => {
    if (!ws || !noteId) {
      return;
    }

    const resendPendingCommit = (reason: string) => {
      if (!refs.pendingCommitPayloadRef.current) {
        return;
      }

      const ok = ws.send(makeCommitDraft(noteId));
      logDraftWs(
        ok ? 'RECONNECT' : 'STATE',
        'COMMIT_DRAFT_REQUEST',
        {
          noteId,
          reason,
          attempt: refs.commitRetryCountRef.current,
          status: ok ? 'resent' : 'failed',
        },
        createDraftWsSnapshot(refs, {
          noteId,
          draftPhase,
          reason,
          isConnected: !!ws?.isConnected,
        })
      );

      if (ok) {
        refs.awaitingCommitRef.current = true;
        refs.awaitingCommitPayloadRef.current =
          refs.pendingCommitPayloadRef.current;
        refs.pendingCommitPayloadRef.current = null;
        setDraftPhase('COMMITTING');
      } else {
        scheduleCommitRetry(`event:${reason}`);
      }
    };

    const onOnline = () => resendPendingCommit('online');
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        resendPendingCommit('visible');
      }
    };

    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [draftPhase, noteId, refs, scheduleCommitRetry, setDraftPhase, ws]);

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
  }, [noteId, refs, storedDraft]);

  const send = useDraftSender({
    noteId,
    ws,
    refs,
    lastCommitAt,
    dispatch,
    setIsSaving,
    setDraftPhase,
  });

  useDraftListeners({
    ws,
    noteId,
    refs,
    lastCommitAt,
    layouts,
    dispatch,
    setIsSaving,
    setDraftPhase,
    setLastSavedAt,
    setLastCommitAt,
    onRemoteDraft,
    onRemoteCommit,
    onCommitRetryRequired: reason => {
      scheduleCommitRetry(reason);
    },
    onCommitRetryResolved: () => {
      resetCommitRetryState();
    },
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
        setDraftPhase('COMMITTING');

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

        const ok = ws.send(makeCommitDraft(noteId));
        logDraftWs('SEND', 'COMMIT_DRAFT_REQUEST', {
          noteId,
          attempt: refs.commitRetryCountRef.current,
          status: ok ? 'sent' : 'buffered',
        });

        if (!ok) {
          refs.pendingCommitPayloadRef.current =
            refs.awaitingCommitPayloadRef.current;
          scheduleCommitRetry('initial-send-failed');
        } else {
          resetCommitRetryState();
        }

        return true;
      } catch (_e) {
        refs.pendingCommitPayloadRef.current =
          refs.awaitingCommitPayloadRef.current;
        logDraftWs('SEND', 'COMMIT_DRAFT_REQUEST', {
          noteId,
          attempt: refs.commitRetryCountRef.current,
          status: 'error-buffered',
        });
        scheduleCommitRetry('exception');
        return false;
      }
    },
    [
      noteId,
      refs,
      resetCommitRetryState,
      scheduleCommitRetry,
      setDraftPhase,
      ws,
    ]
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
    draftPhase,
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
