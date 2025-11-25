import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'widgets/hooks/useWebSocket';
import { useWSContext } from 'widgets/providers/WebSocketProvider';
import useDebounced from 'widgets/hooks/useDebounced';
import { makeUpdateDraft, makeCommitDraft } from 'shared/model/ws';
import type { UpdateDraftPayload, CommitDraftPayload } from 'shared/model/ws';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { setDraft, removeDraft } from 'app/store/slices/draftsSlice';

interface UseDraftSyncOpts {
  noteId: string | null | undefined;
  userId: string;
  serverUrl?: string;
  draft: string;
  debounceMs?: number;
  onRemoteDraft?: (newDraft: string) => void;
  onRemoteCommit?: () => void;
}

export const useDraftSync = ({
  noteId,
  userId,
  serverUrl = '/wn/api/connection',
  draft,
  debounceMs = 800,
  onRemoteDraft,
  onRemoteCommit,
}: UseDraftSyncOpts) => {
  const debounced = useDebounced(draft, debounceMs);
  const ctx = useWSContext();
  const ws = ctx ?? useWebSocket({ url: serverUrl, userId });
  const dispatch = useAppDispatch();
  const storedDraft = useAppSelector((s: any) =>
    noteId ? (s.drafts?.[noteId] ?? null) : null
  );

  try {
    console.debug('[useDraftSync] hook init', { noteId, userId, serverUrl });
  } catch (_e) {}

  // track last local edit time so we can compare with last commit ack
  const lastEditAtRef = useRef<number | null>(null);
  // skip sending the initial restored/loaded draft on mount/open
  const skipInitialSendRef = useRef<boolean>(true);
  // track time of manual sends (sendUpdateDraft) to avoid a following
  // debounced-effect resend of an earlier value
  const lastManualSendAtRef = useRef<number | null>(null);
  useEffect(() => {
    lastEditAtRef.current = Date.now();
  }, [draft]);
  const [lastCommitAt, setLastCommitAt] = useState<number | null>(null);
  const prevSentRef = useRef<string | null>(null);
  // value that was sent to server and is awaiting acknowledgement
  const awaitingAckRef = useRef<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  // true while waiting for commit acknowledgement from server
  const awaitingCommitRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  // keep latest draft value in a ref so async handlers can read current content
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // on mount try to restore any cached pending draft for this note
  useEffect(() => {
    try {
      console.debug('[useDraftSync] mount effect start', { noteId });
    } catch (_e) {}
    if (!noteId) return;
    // when noteId changes, skip initial send until user edits
    skipInitialSendRef.current = true;
    try {
      if (storedDraft != null) {
        pendingRef.current = storedDraft;
        try {
          console.debug('[useDraftSync] restored pending draft from store', {
            noteId,
            len: storedDraft.length,
          });
        } catch (_e) {}
      }
    } catch (_e) {}
    return () => {
      try {
        console.debug('[useDraftSync] unmounting mount-effect', { noteId });
      } catch (_e) {}
    };
  }, [noteId]);

  const send = useCallback(
    (value: string) => {
      if (!ws || !noteId) {
        return false;
      }
      // avoid sending if same value is already confirmed or awaiting ack
      if (prevSentRef.current === value || awaitingAckRef.current === value) {
        try {
          console.debug(
            '[useDraftSync] skipping send - already sent/awaiting',
            {
              noteId,
            }
          );
        } catch (_e) {}
        return true;
      }
      // if a commit is in progress, suppress update sends until commit ack
      if (awaitingCommitRef.current) {
        try {
          console.debug(
            '[useDraftSync] suppressing update send during commit',
            {
              noteId,
            }
          );
        } catch (_e) {}
        pendingRef.current = value;
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}
        return false;
      }
      try {
        sendingRef.current = true;
        // mark as saving while awaiting server acknowledgement
        setIsSaving(true);

        const event = makeUpdateDraft(noteId, value);
        const ok = ws.send(event);
        if (ok) {
          // mark as sent and wait for server response to confirm
          awaitingAckRef.current = value;
          pendingRef.current = null;
          // persist until server acknowledges so we don't lose draft across reloads
          try {
            dispatch(setDraft({ noteId, text: value }));
          } catch (_e) {}
          sendingRef.current = false;
          return true;
        }

        try {
          console.debug(
            '[useDraftSync] ws.send returned falsy, queueing draft',
            { noteId }
          );
        } catch (_e) {}
        pendingRef.current = value;
        try {
          dispatch(setDraft({ noteId, text: value }));
          try {
            console.debug('[useDraftSync] persisted pending draft to store', {
              noteId,
            });
          } catch (_e) {}
        } catch (_e) {}

        const unsub = ws.onOpen?.(() => {
          try {
            const toSend = pendingRef.current;
            try {
              console.debug(
                '[useDraftSync] onOpen handler invoked, pending present?',
                { noteId, has: !!toSend, pendingLen: toSend?.length ?? 0 }
              );
            } catch (_e) {}
            if (toSend != null) {
              const res = ws.send(makeUpdateDraft(noteId, toSend));
              try {
                console.debug(
                  '[useDraftSync] attempted send of pending on open',
                  { noteId, res }
                );
              } catch (_e) {}
              if (res) {
                // mark as awaiting acknowledgement
                awaitingAckRef.current = toSend;
                pendingRef.current = null;
                try {
                  // keep persisted until ack in store
                  dispatch(setDraft({ noteId, text: toSend }));
                  try {
                    console.debug(
                      '[useDraftSync] persisted pending to store after send on open',
                      { noteId }
                    );
                  } catch (_e) {}
                } catch (_e) {}
                setIsSaving(true);
              }
            }
          } catch (_) {}
          try {
            if (unsub) unsub();
          } catch (_) {}
        });

        setIsSaving(false);
        sendingRef.current = false;
        return false;
      } catch (err) {
        try {
          console.error('[useDraftSync] send unexpected error', err);
        } catch (_e) {}
        // on unexpected failure — keep value queued and cached
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}
        setIsSaving(false);
        sendingRef.current = false;
        return false;
      }
    },
    [ws, noteId]
  );

  useEffect(() => {
    if (!ws || !noteId) return;
    try {
      console.debug('[useDraftSync] subscribing to server events', { noteId });
    } catch (_e) {}

    // subscribe to incoming draft/commit events from server (broadcasts)
    const unsubUpdate =
      ws.subscribe?.('UPDATE_DRAFT_REQUEST', (payload: unknown) => {
        try {
          try {
            console.debug('[useDraftSync] incoming UPDATE_DRAFT_REQUEST', {
              noteId,
            });
          } catch (_e) {}
          const data = payload as UpdateDraftPayload;
          if (!data || data.noteId !== noteId) return;
          const nd = data.newDraft ?? '';
          // If we have a local pending draft or a draft awaiting server ack,
          // prefer local changes and ignore incoming server draft to avoid
          // overwriting user's in-progress work.
          if (pendingRef.current != null || awaitingAckRef.current != null) {
            try {
              console.debug(
                '[useDraftSync] incoming UPDATE ignored due to local pending',
                { noteId }
              );
            } catch (_e) {}
            return;
          }
          try {
            console.debug('[useDraftSync] applying remote draft', {
              noteId,
              len: nd.length,
            });
          } catch (_e) {}
          try {
            console.debug('[useDraftSync] incoming draft details', {
              noteId,
              prevSentExists: !!prevSentRef.current,
              hasPending: !!pendingRef.current,
            });
          } catch (_e) {}
          prevSentRef.current = nd;
          pendingRef.current = null;
          try {
            if (nd) dispatch(setDraft({ noteId, text: nd }));
            else dispatch(removeDraft({ noteId }));
          } catch (_e) {}
          if (onRemoteDraft) onRemoteDraft(nd);
          setLastSavedAt(new Date().toISOString());
        } catch (_e) {
          try {
            console.error(
              '[useDraftSync] error handling incoming UPDATE_DRAFT_REQUEST',
              _e
            );
          } catch (_err) {}
        }
      }) ?? (() => {});

    const unsubUpdateResp =
      ws.subscribe?.('UPDATE_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          if (data.noteId && data.noteId !== noteId) return;
          try {
            console.debug('[useDraftSync] incoming UPDATE_DRAFT_RESPONSE', {
              noteId,
              status: data.status,
              remoteNoteId: data.noteId,
            });
          } catch (_e) {}
          if (data.status) {
            // server confirmed our last sent draft
            const acked = awaitingAckRef.current;
            if (acked != null) {
              prevSentRef.current = acked;
            }
            awaitingAckRef.current = null;
            pendingRef.current = null;
            try {
              dispatch(removeDraft({ noteId }));
            } catch (_e) {}
            setIsSaving(false);
            setLastSavedAt(new Date().toISOString());
          } else {
            // server reported failure — keep awaiting/queued state so client can retry
            setIsSaving(false);
          }
        } catch (_e) {
          try {
            console.error(
              '[useDraftSync] error handling UPDATE_DRAFT_RESPONSE',
              _e
            );
          } catch (_err) {}
        }
      }) ?? (() => {});

    const unsubCommit =
      ws.subscribe?.('COMMIT_DRAFT_REQUEST', (payload: unknown) => {
        try {
          try {
            console.debug('[useDraftSync] incoming COMMIT_DRAFT_REQUEST', {
              noteId,
            });
          } catch (_e) {}
          const data = payload as CommitDraftPayload;
          if (!data || data.noteId !== noteId) return;
          // clear local draft cache on commit
          try {
            dispatch(removeDraft({ noteId }));
            try {
              console.debug('[useDraftSync] cleared draft in store on commit', {
                noteId,
              });
            } catch (_e) {}
          } catch (_e) {}
          try {
            console.debug('[useDraftSync] incoming commit applied', { noteId });
          } catch (_e) {}
          if (onRemoteCommit) onRemoteCommit();
        } catch (_e) {
          try {
            console.error(
              '[useDraftSync] error handling incoming COMMIT_DRAFT_REQUEST',
              _e
            );
          } catch (_err) {}
        }
      }) ?? (() => {});

    // server acknowledgement for commit
    const unsubCommitResp =
      ws.subscribe?.('COMMIT_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          // accept response either when noteId matches or when server omitted noteId
          if (data.noteId && data.noteId !== noteId) return;
          try {
            console.debug('[useDraftSync] incoming COMMIT_DRAFT_RESPONSE', {
              noteId,
              status: data.status,
              remoteNoteId: data.noteId,
            });
          } catch (_e) {}
          if (data.status) {
            // commit accepted by server — mark note synced
            // prefer the value we were awaiting ack for, otherwise current draft
            const confirmed =
              awaitingAckRef.current ?? draftRef.current ?? null;
            if (confirmed != null) prevSentRef.current = confirmed;
            awaitingAckRef.current = null;
            pendingRef.current = null;
            try {
              dispatch(removeDraft({ noteId }));
            } catch (_e) {}
            // commit ack received - stop suppressing update sends
            awaitingCommitRef.current = false;
            setLastCommitAt(Date.now());
            setIsSaving(false);
            setLastSavedAt(new Date().toISOString());
            if (onRemoteCommit) onRemoteCommit();
          } else {
            awaitingCommitRef.current = false;
            setIsSaving(false);
          }
        } catch (_e) {
          try {
            console.error(
              '[useDraftSync] error handling COMMIT_DRAFT_RESPONSE',
              _e
            );
          } catch (_err) {}
        }
      }) ?? (() => {});

    return () => {
      try {
        if (unsubUpdate) unsubUpdate();
      } catch (_e) {}
      try {
        if (unsubUpdateResp) unsubUpdateResp();
      } catch (_e) {}
      try {
        if (unsubCommit) unsubCommit();
      } catch (_e) {}
      try {
        if (unsubCommitResp) unsubCommitResp();
      } catch (_e) {}
      try {
        console.debug('[useDraftSync] unsubscribed from server events', {
          noteId,
        });
      } catch (_e) {}
    };
  }, [ws, noteId, onRemoteDraft, onRemoteCommit]);
  useEffect(() => {
    if (!noteId) return;
    try {
      console.debug('[useDraftSync] debounced effect', {
        noteId,
        debouncedLen: debounced?.length ?? 0,
        prevSentLen: prevSentRef.current?.length ?? 0,
        hasPending: !!pendingRef.current,
      });
    } catch (_e) {}
    // Skip sending the initial value that was loaded when opening the note
    if (skipInitialSendRef.current) {
      try {
        console.debug('[useDraftSync] skipping initial send on open', {
          noteId,
        });
      } catch (_e) {}
      skipInitialSendRef.current = false;
      return;
    }

    // If we performed a manual send (e.g. discard which calls sendUpdateDraft(''))
    // very recently, avoid sending whatever the debounced value now is because
    // it can be an earlier user edit that raced with the manual send.
    if (
      lastManualSendAtRef.current != null &&
      Date.now() - lastManualSendAtRef.current < debounceMs + 200
    ) {
      try {
        console.debug(
          '[useDraftSync] skipping debounced send due to recent manual send',
          {
            noteId,
          }
        );
      } catch (_e) {}
      // clear marker so only one skip occurs
      lastManualSendAtRef.current = null;
      return;
    }

    if (debounced === prevSentRef.current) {
      try {
        console.debug(
          '[useDraftSync] debounced equals prevSent; skipping send',
          {
            noteId,
          }
        );
      } catch (_e) {}
      return;
    }
    send(debounced);
  }, [debounced, noteId, send]);

  const commitDraft = useCallback(() => {
    if (!noteId || !ws) return false;
    try {
      try {
        console.debug('[useDraftSync] commitDraft invoked', { noteId });
      } catch (_e) {}
      // mark that a commit is in progress to avoid sending update drafts
      awaitingCommitRef.current = true;
      ws.send(makeCommitDraft(noteId));
      try {
        console.debug('[useDraftSync] commitDraft ws.send called', { noteId });
      } catch (_e) {}
      return true;
    } catch (_) {
      try {
        console.error('[useDraftSync] commitDraft failed', { noteId });
      } catch (_e) {}
      return false;
    }
  }, [noteId, ws]);

  const sendUpdateDraft = useCallback(
    (value: string) => {
      try {
        console.debug('[useDraftSync] sendUpdateDraft called', {
          noteId,
          len: value?.length,
        });
      } catch (_e) {}
      if (!noteId) return false;
      // mark manual send time so the debounced effect can avoid resending
      try {
        lastManualSendAtRef.current = Date.now();
      } catch (_e) {}
      return send(value);
    },
    [noteId, send]
  );

  return {
    commitDraft,
    isConnected: !!ws?.isConnected,
    isSaving,
    isPending: !!pendingRef.current,
    isSynced:
      (prevSentRef.current === draft && pendingRef.current == null) ||
      (!!lastCommitAt &&
        lastEditAtRef.current != null &&
        lastCommitAt >= lastEditAtRef.current &&
        pendingRef.current == null),
    lastSavedAt,
    sendRaw: ws?.send ?? (() => false),
    subscribe: ws?.subscribe ?? (() => () => {}),
    sendUpdateDraft,
  } as const;
};

export default useDraftSync;
