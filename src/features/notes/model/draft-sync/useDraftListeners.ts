import {
  addNotification,
  removeDraft,
  setDraft,
  updateTabNote,
  type CommitDraftPayload,
  type UpdateDraftPayload,
} from '@/entities';
import type { Layout } from '@/entities/layout';
import { useEffect } from 'react';
import { applyCommittedPayloadToNoteCaches } from './cacheUpdates';
import { reportDraftSyncError } from './errors';
import type { DraftPhase, DraftRefs, DraftWebSocketClient } from './types';

interface UseDraftListenersOpts {
  ws: DraftWebSocketClient | null | undefined;
  noteId: string | null | undefined;
  refs: DraftRefs;
  lastCommitAt: number | null;
  layouts: Layout[];
  dispatch: (action: unknown) => unknown;
  setIsSaving: (value: boolean) => void;
  setDraftPhase: (value: DraftPhase) => void;
  setLastSavedAt: (value: string | null) => void;
  setLastCommitAt: (value: number | null) => void;
  onRemoteDraft?: (newDraft: string) => void;
  onRemoteCommit?: () => void;
  onCommitRetryRequired?: (reason: string) => void;
  onCommitRetryResolved?: () => void;
}

export const useDraftListeners = ({
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
  onCommitRetryRequired,
  onCommitRetryResolved,
}: UseDraftListenersOpts) => {
  const isDraftDebug = import.meta.env.DEV;
  const logDraft = (message: string, extra?: Record<string, unknown>) => {
    if (!isDraftDebug || !noteId) return;
    if (extra) {
      console.log(`[draft-ws][${noteId}] ${message}`, extra);
      return;
    }
    console.log(`[draft-ws][${noteId}] ${message}`);
  };

  useEffect(() => {
    if (!ws || !noteId) {
      return;
    }

    const unsubUpdate =
      ws.subscribe?.('UPDATE_DRAFT_REQUEST', (payload: unknown) => {
        try {
          try {
            const until = refs.suppressRemoteUntilRef.current;
            if (until != null && Date.now() < until) {
              return;
            }
          } catch (error) {
            reportDraftSyncError('UPDATE_DRAFT_REQUEST:suppress-check', error, {
              noteId,
            });
          }

          const data = payload as UpdateDraftPayload;
          if (!data || data.noteId !== noteId) {
            return;
          }
          const nd = data.newDraft ?? '';

          logDraft('UPDATE_DRAFT_REQUEST', {
            newDraftLength: nd.length,
            pending: refs.pendingRef.current != null,
            awaitingAck: refs.awaitingAckRef.current != null,
          });

          if (
            refs.pendingRef.current != null ||
            refs.awaitingAckRef.current != null
          ) {
            return;
          }

          try {
            if (
              lastCommitAt != null &&
              refs.lastEditAtRef.current != null &&
              lastCommitAt >= refs.lastEditAtRef.current &&
              refs.lastCommittedPayloadRef.current != null &&
              nd !== refs.lastCommittedPayloadRef.current
            ) {
              return;
            }
          } catch (error) {
            reportDraftSyncError(
              'UPDATE_DRAFT_REQUEST:last-commit-check',
              error,
              {
                noteId,
              }
            );
          }

          refs.prevSentRef.current = nd;
          refs.pendingRef.current = null;

          try {
            if (nd) {
              dispatch(setDraft({ noteId, text: nd }));
            } else {
              dispatch(removeDraft({ noteId }));
            }
          } catch (error) {
            reportDraftSyncError(
              'UPDATE_DRAFT_REQUEST:apply-remote-draft',
              error,
              {
                noteId,
              }
            );
          }

          if (onRemoteDraft) onRemoteDraft(nd);
          setLastSavedAt(new Date().toISOString());
        } catch (error) {
          reportDraftSyncError('UPDATE_DRAFT_REQUEST:handler', error, {
            noteId,
          });
        }
      }) ?? (() => {});

    const unsubUpdateResp =
      ws.subscribe?.('UPDATE_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          if (data.noteId && data.noteId !== noteId) return;

          logDraft('UPDATE_DRAFT_RESPONSE', {
            status: !!data.status,
            hasAwaitingAck: refs.awaitingAckRef.current != null,
          });

          if (data.status) {
            const acked = refs.awaitingAckRef.current;
            if (acked != null) {
              refs.prevSentRef.current = acked;
            }
            refs.awaitingAckRef.current = null;
            refs.pendingRef.current = null;
            setIsSaving(false);
            setDraftPhase('IDLE');
            setLastSavedAt(new Date().toISOString());
          } else {
            setIsSaving(false);
            setDraftPhase('PENDING_UPDATE');
          }
        } catch (error) {
          reportDraftSyncError('UPDATE_DRAFT_RESPONSE:handler', error, {
            noteId,
          });
        }
      }) ?? (() => {});

    const unsubCommit =
      ws.subscribe?.('COMMIT_DRAFT_REQUEST', (payload: unknown) => {
        try {
          const data = payload as CommitDraftPayload;
          if (!data || data.noteId !== noteId) {
            return;
          }

          logDraft('COMMIT_DRAFT_REQUEST');

          try {
            dispatch(removeDraft({ noteId }));
          } catch (error) {
            reportDraftSyncError(
              'COMMIT_DRAFT_REQUEST:remove-local-draft',
              error,
              {
                noteId,
              }
            );
          }

          if (onRemoteCommit) onRemoteCommit();
        } catch (error) {
          reportDraftSyncError('COMMIT_DRAFT_REQUEST:handler', error, {
            noteId,
          });
        }
      }) ?? (() => {});

    const unsubCommitResp =
      ws.subscribe?.('COMMIT_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          if (data.noteId && data.noteId !== noteId) return;

          logDraft('COMMIT_DRAFT_RESPONSE', {
            status: !!data.status,
            awaitingCommitPayloadLength:
              refs.awaitingCommitPayloadRef.current?.length ?? 0,
          });

          if (data.status) {
            onCommitRetryResolved?.();

            const confirmed =
              refs.awaitingAckRef.current ??
              refs.awaitingCommitPayloadRef.current ??
              refs.draftRef.current ??
              null;

            if (confirmed != null) refs.prevSentRef.current = confirmed;
            refs.awaitingAckRef.current = null;
            refs.pendingRef.current = null;

            try {
              dispatch(
                updateTabNote({
                  noteId,
                  updates: {
                    payload: confirmed as string,
                    draft: '',
                    updatedAt: new Date().toISOString(),
                  },
                })
              );
            } catch (error) {
              reportDraftSyncError(
                'COMMIT_DRAFT_RESPONSE:update-tab-note',
                error,
                {
                  noteId,
                }
              );
            }

            try {
              dispatch(removeDraft({ noteId }));
            } catch (error) {
              reportDraftSyncError(
                'COMMIT_DRAFT_RESPONSE:remove-local-draft',
                error,
                {
                  noteId,
                }
              );
            }

            try {
              refs.lastCommittedPayloadRef.current = confirmed as string;
            } catch (error) {
              reportDraftSyncError(
                'COMMIT_DRAFT_RESPONSE:set-last-committed-payload',
                error,
                {
                  noteId,
                }
              );
            }

            try {
              refs.suppressRemoteUntilRef.current = Date.now() + 3500;
            } catch (error) {
              reportDraftSyncError(
                'COMMIT_DRAFT_RESPONSE:suppress-remote-window',
                error,
                {
                  noteId,
                }
              );
            }

            try {
              if (confirmed != null) {
                applyCommittedPayloadToNoteCaches({
                  dispatch,
                  layouts,
                  noteId,
                  payload: confirmed,
                });
              }
            } catch (error) {
              reportDraftSyncError(
                'COMMIT_DRAFT_RESPONSE:update-query-caches',
                error,
                {
                  noteId,
                }
              );
            }

            refs.awaitingCommitRef.current = false;
            refs.awaitingCommitPayloadRef.current = null;
            setLastCommitAt(Date.now());
            setIsSaving(false);
            setDraftPhase('IDLE');
            setLastSavedAt(new Date().toISOString());

            if (onRemoteCommit) onRemoteCommit();
          } else {
            refs.pendingCommitPayloadRef.current =
              refs.awaitingCommitPayloadRef.current;
            refs.awaitingCommitRef.current = false;
            setIsSaving(false);
            setDraftPhase('PENDING_UPDATE');
            dispatch(
              addNotification({
                type: 'error',
                message: 'Не удалось сохранить черновик. Попробуйте ещё раз.',
                duration: 6000,
                origin: 'ui',
              })
            );
            onCommitRetryRequired?.('commit-response-error');
          }
        } catch (error) {
          reportDraftSyncError('COMMIT_DRAFT_RESPONSE:handler', error, {
            noteId,
          });
        }
      }) ?? (() => {});

    return () => {
      try {
        if (unsubUpdate) unsubUpdate();
      } catch (error) {
        reportDraftSyncError('unsubscribe:UPDATE_DRAFT_REQUEST', error, {
          noteId,
        });
      }
      try {
        if (unsubUpdateResp) unsubUpdateResp();
      } catch (error) {
        reportDraftSyncError('unsubscribe:UPDATE_DRAFT_RESPONSE', error, {
          noteId,
        });
      }
      try {
        if (unsubCommit) unsubCommit();
      } catch (error) {
        reportDraftSyncError('unsubscribe:COMMIT_DRAFT_REQUEST', error, {
          noteId,
        });
      }
      try {
        if (unsubCommitResp) unsubCommitResp();
      } catch (error) {
        reportDraftSyncError('unsubscribe:COMMIT_DRAFT_RESPONSE', error, {
          noteId,
        });
      }
    };
  }, [
    ws,
    noteId,
    refs,
    lastCommitAt,
    dispatch,
    setIsSaving,
    setDraftPhase,
    setLastSavedAt,
    setLastCommitAt,
    onRemoteDraft,
    onRemoteCommit,
    onCommitRetryRequired,
    onCommitRetryResolved,
  ]);
};
