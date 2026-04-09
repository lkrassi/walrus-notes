import {
  addNotification,
  makeUpdateDraft,
  removeDraft,
  setDraft,
} from '@/entities';
import { handleError } from '@/shared';
import { useCallback } from 'react';
import { reportDraftSyncError } from './errors';
import type { DraftPhase, DraftRefs, DraftWebSocketClient } from './types';

interface UseDraftSenderOpts {
  noteId: string | null | undefined;
  ws: DraftWebSocketClient | null | undefined;
  refs: DraftRefs;
  lastCommitAt: number | null;
  dispatch: (action: unknown) => unknown;
  setIsSaving: (value: boolean) => void;
  setDraftPhase: (value: DraftPhase) => void;
}

export const useDraftSender = ({
  noteId,
  ws,
  refs,
  lastCommitAt,
  dispatch,
  setIsSaving,
  setDraftPhase,
}: UseDraftSenderOpts) => {
  const notifyDraftSync = useCallback(
    (message: string) => {
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 6000,
          origin: 'ui',
        })
      );
    },
    [dispatch]
  );

  const notifyDraftSendError = useCallback(
    (scope: string, error: unknown) => {
      handleError(error, {
        type: 'draft-sync',
        message: 'Не удалось синхронизировать черновик. Попробуйте ещё раз.',
        notify: notifyDraftSync,
        report: true,
        reporter: (reportedError, type) => {
          reportDraftSyncError(`${scope}:${type}`, reportedError, { noteId });
        },
        logger: (message, loggedError) => {
          console.error(`${message} [draft-sync:${scope}]`, loggedError);
        },
      });
    },
    [notifyDraftSync, noteId]
  );

  const send = useCallback(
    (value: string) => {
      if (!ws || !noteId) {
        return false;
      }
      if (
        lastCommitAt != null &&
        refs.lastEditAtRef.current != null &&
        lastCommitAt >= refs.lastEditAtRef.current
      ) {
        try {
          dispatch(removeDraft({ noteId }));
        } catch (error) {
          notifyDraftSendError('send:remove-draft-after-commit-check', error);
          return false;
        }
        setDraftPhase('IDLE');
        return false;
      }

      if (
        refs.prevSentRef.current === value ||
        refs.awaitingAckRef.current === value
      ) {
        refs.suppressRemoteUntilRef.current = Date.now() + 3500;
        return true;
      }

      if (refs.awaitingCommitRef.current) {
        refs.pendingRef.current = value;
        setDraftPhase('PENDING_UPDATE');
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (error) {
          notifyDraftSendError('send:set-pending-draft', error);
          return false;
        }
        return false;
      }

      try {
        refs.sendingRef.current = true;
        setIsSaving(true);

        const event = makeUpdateDraft(noteId, value);
        const ok = ws.send(event);
        if (ok) {
          refs.awaitingAckRef.current = value;
          refs.pendingRef.current = null;
          setDraftPhase('AWAITING_ACK');
          try {
            dispatch(setDraft({ noteId, text: value }));
          } catch (error) {
            notifyDraftSendError('send:set-awaiting-ack-draft', error);
            setIsSaving(false);
            refs.sendingRef.current = false;
            return false;
          }
          refs.sendingRef.current = false;
          return true;
        }

        refs.pendingRef.current = value;
        setDraftPhase('PENDING_UPDATE');
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (error) {
          notifyDraftSendError('send:set-queued-draft', error);
          setIsSaving(false);
          refs.sendingRef.current = false;
          return false;
        }

        const unsub = ws.onOpen?.(() => {
          try {
            const toSend = refs.pendingRef.current;
            if (toSend != null) {
              const res = ws.send(makeUpdateDraft(noteId, toSend));
              if (res) {
                refs.awaitingAckRef.current = toSend;
                refs.pendingRef.current = null;
                setDraftPhase('AWAITING_ACK');
                try {
                  dispatch(setDraft({ noteId, text: toSend }));
                } catch (error) {
                  notifyDraftSendError(
                    'send:on-open:set-reopened-draft',
                    error
                  );
                }
                setIsSaving(true);
              }
            }
          } catch (error) {
            notifyDraftSendError('send:on-open:send-queued-draft', error);
          }
          try {
            if (unsub) unsub();
          } catch (error) {
            reportDraftSyncError('send:on-open:unsubscribe', error, {
              noteId,
            });
          }
        });

        setIsSaving(false);
        refs.sendingRef.current = false;
        return false;
      } catch (error) {
        notifyDraftSendError('send:handler', error);
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (persistError) {
          notifyDraftSendError('send:handler:set-draft-fallback', persistError);
        }
        setIsSaving(false);
        refs.sendingRef.current = false;
        return false;
      }
    },
    [
      ws,
      noteId,
      lastCommitAt,
      refs,
      dispatch,
      setIsSaving,
      setDraftPhase,
      notifyDraftSendError,
    ]
  );

  return send;
};
