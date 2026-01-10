import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'widgets/hooks/useWebSocket';
import { useWSContext } from 'widgets/providers/WebSocketProvider';
import useDebounced from 'widgets/hooks/useDebounced';
import { makeUpdateDraft, makeCommitDraft } from 'shared/model/ws';
import type { UpdateDraftPayload, CommitDraftPayload } from 'shared/model/ws';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { setDraft, removeDraft } from 'app/store/slices/draftsSlice';
import { notesApi } from 'app/store/api/notesApi';
import { layoutApi } from 'app/store/api/layoutApi';
import { store } from 'app/store';
import { updateTabNote } from 'app/store/slices/tabsSlice';

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
  const storedDraft = useAppSelector(state =>
    noteId ? (state.drafts?.[noteId] ?? null) : null
  );

  const lastEditAtRef = useRef<number | null>(null);
  const skipInitialSendRef = useRef<boolean>(true);
  const initialPayloadRef = useRef<string | null>(null);
  const suppressRemoteUntilRef = useRef<number | null>(null);
  const lastManualSendAtRef = useRef<number | null>(null);
  useEffect(() => {
    lastEditAtRef.current = Date.now();
  }, [draft]);
  const [lastCommitAt, setLastCommitAt] = useState<number | null>(null);
  const prevSentRef = useRef<string | null>(null);
  const awaitingAckRef = useRef<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const awaitingCommitRef = useRef(false);
  const awaitingCommitPayloadRef = useRef<string | null>(null);
  const lastCommittedPayloadRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
    try {
      if (
        lastCommittedPayloadRef.current != null &&
        draft != lastCommittedPayloadRef.current
      ) {
        lastCommittedPayloadRef.current = null;
      }
    } catch (_e) {}
  }, [draft]);

  useEffect(() => {
    if (!noteId) return;
    skipInitialSendRef.current = true;
    try {
      if (storedDraft != null) {
        pendingRef.current = storedDraft;
      }
      try {
        initialPayloadRef.current = draftRef.current ?? null;
      } catch (_e) {
        initialPayloadRef.current = null;
      }
    } catch (_e) {}
    return () => {};
  }, [noteId]);

  const send = useCallback(
    (value: string) => {
      if (!ws || !noteId) {
        return false;
      }
      try {
        if (
          lastCommitAt != null &&
          lastEditAtRef.current != null &&
          lastCommitAt >= lastEditAtRef.current
        ) {
          try {
            dispatch(removeDraft({ noteId }));
          } catch (_e) {}
          return false;
        }
      } catch (_e) {}
      if (prevSentRef.current === value || awaitingAckRef.current === value) {
        try {
          suppressRemoteUntilRef.current = Date.now() + 3500;
        } catch (_e) {}
        return true;
      }
      if (awaitingCommitRef.current) {
        pendingRef.current = value;
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}
        return false;
      }
      try {
        sendingRef.current = true;
        setIsSaving(true);

        const event = makeUpdateDraft(noteId, value);
        const ok = ws.send(event);
        if (ok) {
          awaitingAckRef.current = value;
          pendingRef.current = null;
          try {
            dispatch(setDraft({ noteId, text: value }));
          } catch (_e) {}
          sendingRef.current = false;
          return true;
        }

        pendingRef.current = value;
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}

        const unsub = ws.onOpen?.(() => {
          try {
            const toSend = pendingRef.current;
            if (toSend != null) {
              const res = ws.send(makeUpdateDraft(noteId, toSend));
              if (res) {
                awaitingAckRef.current = toSend;
                pendingRef.current = null;
                try {
                  dispatch(setDraft({ noteId, text: toSend }));
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
      } catch (_e) {
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

    const unsubUpdate =
      ws.subscribe?.('UPDATE_DRAFT_REQUEST', (payload: unknown) => {
        try {
          try {
            const until = suppressRemoteUntilRef.current;
            if (until != null && Date.now() < until) return;
          } catch (_e) {}
          const data = payload as UpdateDraftPayload;
          if (!data || data.noteId !== noteId) return;
          const nd = data.newDraft ?? '';
          if (pendingRef.current != null || awaitingAckRef.current != null) {
            return;
          }
          try {
            if (
              lastCommitAt != null &&
              lastEditAtRef.current != null &&
              lastCommitAt >= lastEditAtRef.current &&
              lastCommittedPayloadRef.current != null &&
              nd !== lastCommittedPayloadRef.current
            ) {
              return;
            }
          } catch (_e) {}
          prevSentRef.current = nd;
          pendingRef.current = null;
          try {
            if (nd) {
              dispatch(setDraft({ noteId, text: nd }));
            } else {
              dispatch(removeDraft({ noteId }));
            }
          } catch (_e) {}
          if (onRemoteDraft) onRemoteDraft(nd);
          setLastSavedAt(new Date().toISOString());
        } catch (_e) {}
      }) ?? (() => {});

    const unsubUpdateResp =
      ws.subscribe?.('UPDATE_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          if (data.noteId && data.noteId !== noteId) return;
          if (data.status) {
            const acked = awaitingAckRef.current;
            if (acked != null) {
              prevSentRef.current = acked;
            }
            awaitingAckRef.current = null;
            pendingRef.current = null;
            setIsSaving(false);
            setLastSavedAt(new Date().toISOString());
          } else {
            setIsSaving(false);
          }
        } catch (_e) {}
      }) ?? (() => {});

    const unsubCommit =
      ws.subscribe?.('COMMIT_DRAFT_REQUEST', (payload: unknown) => {
        try {
          const data = payload as CommitDraftPayload;
          if (!data || data.noteId !== noteId) return;
          try {
            dispatch(removeDraft({ noteId }));
          } catch (_e) {}
          if (onRemoteCommit) onRemoteCommit();
        } catch (_e) {}
      }) ?? (() => {});

    const unsubCommitResp =
      ws.subscribe?.('COMMIT_DRAFT_RESPONSE', (payload: unknown) => {
        try {
          const data = payload as { noteId?: string; status?: boolean };
          if (!data) return;
          if (data.noteId && data.noteId !== noteId) return;
          if (data.status) {
            const confirmed =
              awaitingAckRef.current ??
              awaitingCommitPayloadRef.current ??
              draftRef.current ??
              null;
            if (confirmed != null) prevSentRef.current = confirmed;
            awaitingAckRef.current = null;
            pendingRef.current = null;

            try {
              dispatch(
                updateTabNote({
                  noteId,
                  updates: {
                    payload: confirmed as string,
                    updatedAt: new Date().toISOString(),
                  },
                })
              );
            } catch (_e) {}

            try {
              dispatch(removeDraft({ noteId }));
            } catch (_e) {}
            try {
              lastCommittedPayloadRef.current = confirmed as string;
            } catch (_e) {}

            try {
              suppressRemoteUntilRef.current = Date.now() + 3500;
            } catch (_e) {}

            try {
              if (confirmed != null) {
                const state = store.getState();
                const layoutsCache =
                  layoutApi.endpoints.getMyLayouts.select()(state);
                const layouts = layoutsCache.data?.data || [];
                for (const l of layouts) {
                  try {
                    dispatch(
                      notesApi.util.updateQueryData(
                        'getNotes',
                        { layoutId: l.id, page: 1 },
                        draft => {
                          const idx = draft.data.findIndex(
                            n => n.id === noteId
                          );
                          if (idx !== -1)
                            draft.data[idx].payload = confirmed as string;
                        }
                      )
                    );
                  } catch (_e) {}

                  try {
                    dispatch(
                      notesApi.util.updateQueryData(
                        'getPosedNotes',
                        { layoutId: l.id },
                        draft => {
                          const idx = draft.data.findIndex(
                            n => n.id === noteId
                          );
                          if (idx !== -1)
                            draft.data[idx].payload = confirmed as string;
                        }
                      )
                    );
                  } catch (_e) {}

                  try {
                    dispatch(
                      notesApi.util.updateQueryData(
                        'getUnposedNotes',
                        { layoutId: l.id },
                        draft => {
                          const idx = draft.data.findIndex(
                            n => n.id === noteId
                          );
                          if (idx !== -1)
                            draft.data[idx].payload = confirmed as string;
                        }
                      )
                    );
                  } catch (_e) {}
                }
              }
            } catch (_e) {}

            try {
              dispatch(
                updateTabNote({
                  noteId,
                  updates: {
                    payload: confirmed as string,
                    updatedAt: new Date().toISOString(),
                  },
                })
              );
            } catch (_e) {}

            awaitingCommitRef.current = false;
            awaitingCommitPayloadRef.current = null;
            setLastCommitAt(Date.now());
            setIsSaving(false);
            setLastSavedAt(new Date().toISOString());
            if (onRemoteCommit) onRemoteCommit();
          } else {
            awaitingCommitRef.current = false;
            setIsSaving(false);
          }
        } catch (_e) {}
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
    };
  }, [ws, noteId, onRemoteDraft, onRemoteCommit]);
  useEffect(() => {
    if (!noteId) return;

    if (skipInitialSendRef.current) {
      skipInitialSendRef.current = false;
      return;
    }

    try {
      if (
        initialPayloadRef.current != null &&
        prevSentRef.current == null &&
        debounced === initialPayloadRef.current
      ) {
        return;
      }
    } catch (_e) {}

    if (
      lastManualSendAtRef.current != null &&
      Date.now() - lastManualSendAtRef.current < debounceMs + 200
    ) {
      lastManualSendAtRef.current = null;
      return;
    }

    if (debounced === prevSentRef.current) {
      return;
    }
    send(debounced);
  }, [debounced, noteId, send]);

  const commitDraft = useCallback(
    (value?: string) => {
      if (!noteId || !ws) return false;
      try {
        awaitingCommitRef.current = true;
        try {
          suppressRemoteUntilRef.current = Date.now() + 3500;
        } catch (_e) {}
        try {
          lastManualSendAtRef.current = Date.now();
        } catch (_e) {}
        try {
          awaitingCommitPayloadRef.current = value ?? draftRef.current ?? null;
          if (awaitingCommitPayloadRef.current != null)
            prevSentRef.current = awaitingCommitPayloadRef.current;
        } catch (_e) {
          awaitingCommitPayloadRef.current = null;
        }
        ws.send(makeCommitDraft(noteId));
        return true;
      } catch (_) {
        return false;
      }
    },
    [noteId, ws]
  );

  const sendUpdateDraft = useCallback(
    (value: string) => {
      if (!noteId) return false;
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
