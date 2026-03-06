import type { WSEvent, WSEventName } from '@/shared/model';

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

export interface DraftWebSocketClient {
  send: (eventObj: WSEvent) => boolean;
  subscribe: (
    eventName: WSEventName,
    listener: (payload: unknown, raw?: WSEvent) => void
  ) => () => void;
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
  lastCommittedPayloadRef: React.MutableRefObject<string | null>;
  draftRef: React.MutableRefObject<string>;
}
