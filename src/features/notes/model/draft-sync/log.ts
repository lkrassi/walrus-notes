import type { DraftPhase, DraftRefs } from './types';

const DRAFT_WS_DEBUG_FLAG = 'wn:debug:draft-ws';

const isDraftWsDebugEnabled = () => {
  if (!import.meta.env.DEV) {
    return false;
  }

  try {
    if (typeof window === 'undefined') {
      return false;
    }

    return localStorage.getItem(DRAFT_WS_DEBUG_FLAG) === '1';
  } catch (_e) {
    return false;
  }
};

export const logDraftWs = (
  phase: 'SEND' | 'RECV' | 'RECONNECT' | 'STATE',
  event: string,
  details?: unknown,
  snapshot?: Record<string, unknown>
) => {
  if (!isDraftWsDebugEnabled()) {
    return;
  }

  try {
    const ts = new Date().toISOString();
    console.debug(`[DraftWS][${phase}][${event}]`, {
      ts,
      details,
      snapshot,
    });
  } catch (_e) {}
};

export const createDraftWsSnapshot = (
  refs: DraftRefs,
  extra?: {
    noteId?: string;
    draftPhase?: DraftPhase;
    reason?: string;
    isConnected?: boolean;
  }
) => ({
  noteId: extra?.noteId,
  draftPhase: extra?.draftPhase,
  reason: extra?.reason,
  isConnected: extra?.isConnected,
  awaitingAck: refs.awaitingAckRef.current != null,
  hasPendingUpdate: refs.pendingRef.current != null,
  awaitingCommit: refs.awaitingCommitRef.current,
  hasPendingCommit: refs.pendingCommitPayloadRef.current != null,
  commitRetryCount: refs.commitRetryCountRef.current,
});
