import type { Layout } from '@/entities/layout';
import type { WSEvent, WSEventName } from '@/shared/lib/core';

export type DraftPhase =
  | 'IDLE'
  | 'EDITING'
  | 'PENDING_UPDATE'
  | 'AWAITING_ACK'
  | 'COMMITTING';

export interface UseDraftSyncOpts {
  noteId: string | null | undefined;
  userId: string;
  serverUrl?: string;
  draft: string;
  debounceMs?: number;
  onRemoteDraft?: (newDraft: string) => void;
  onRemoteCommit?: () => void;
}

export interface UseDraftSyncReturn {
  commitDraft: (value?: string) => boolean;
  draftPhase: DraftPhase;
  isConnected: boolean;
  isSaving: boolean;
  isPending: boolean;
  isSynced: boolean;
  lastSavedAt: string | null;
  sendRaw: (eventObj: WSEvent) => boolean;
  subscribe: (
    eventName: string,
    listener: (payload: unknown, raw?: unknown) => void
  ) => () => void;
  sendUpdateDraft: (value: string) => boolean;
}

export interface UseDraftSyncDeps {
  ws: DraftWebSocketClient | null | undefined;
  storedDraft: string | null;
  layouts: Layout[];
  dispatch: (action: unknown) => unknown;
}

export interface DraftWebSocketClient {
  send: (eventObj: WSEvent) => boolean;
  subscribe: (
    eventName: WSEventName,
    listener: (payload: unknown, raw?: WSEvent) => void
  ) => () => void;
  isConnected?: boolean;
  onOpen?: (cb: () => void) => () => void;
}

export interface DraftRefs {
  lastEditAtRef: React.MutableRefObject<number | null>;
  skipInitialSendRef: React.MutableRefObject<boolean>;
  initialPayloadRef: React.MutableRefObject<string | null>;
  suppressRemoteUntilRef: React.MutableRefObject<number | null>;
  lastManualSendAtRef: React.MutableRefObject<number | null>;
  prevSentRef: React.MutableRefObject<string | null>;
  awaitingAckRef: React.MutableRefObject<string | null>;
  pendingRef: React.MutableRefObject<string | null>;
  sendingRef: React.MutableRefObject<boolean>;
  awaitingCommitRef: React.MutableRefObject<boolean>;
  awaitingCommitPayloadRef: React.MutableRefObject<string | null>;
  pendingCommitPayloadRef: React.MutableRefObject<string | null>;
  commitRetryCountRef: React.MutableRefObject<number>;
  commitRetryTimerRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;
  lastCommittedPayloadRef: React.MutableRefObject<string | null>;
  draftRef: React.MutableRefObject<string>;
}
