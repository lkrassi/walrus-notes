import {
  layoutApi,
  notesApi,
  removeDraft,
  setDraft,
  updateTabNote,
} from '@/entities';
import type { CommitDraftPayload, UpdateDraftPayload } from '@/shared/model';
import { store, type AppDispatch } from 'app/store';
import { useEffect } from 'react';
import type { DraftRefs, DraftWebSocketClient } from './types';

interface UseDraftListenersOpts {
  ws: DraftWebSocketClient | null | undefined;
  noteId: string | null | undefined;
  refs: DraftRefs;
  lastCommitAt: number | null;
  dispatch: AppDispatch;
  setIsSaving: (value: boolean) => void;
  setLastSavedAt: (value: string | null) => void;
  setLastCommitAt: (value: number | null) => void;
  onRemoteDraft?: (newDraft: string) => void;
  onRemoteCommit?: () => void;
}

export const useDraftListeners = ({
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
}: UseDraftListenersOpts) => {
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
          } catch (_e) {}

          const data = payload as UpdateDraftPayload;
          if (!data || data.noteId !== noteId) {
            return;
          }
          const nd = data.newDraft ?? '';

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
          } catch (_e) {}

          refs.prevSentRef.current = nd;
          refs.pendingRef.current = null;

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
            const acked = refs.awaitingAckRef.current;
            if (acked != null) {
              refs.prevSentRef.current = acked;
            }
            refs.awaitingAckRef.current = null;
            refs.pendingRef.current = null;
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
          if (!data || data.noteId !== noteId) {
            return;
          }

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
                    updatedAt: new Date().toISOString(),
                  },
                })
              );
            } catch (_e) {}

            try {
              dispatch(removeDraft({ noteId }));
            } catch (_e) {}

            try {
              refs.lastCommittedPayloadRef.current = confirmed as string;
            } catch (_e) {}

            try {
              refs.suppressRemoteUntilRef.current = Date.now() + 3500;
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
                          if (idx !== -1) {
                            draft.data[idx].payload = confirmed as string;
                            draft.data[idx].draft = undefined;
                          }
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
                          if (idx !== -1) {
                            draft.data[idx].payload = confirmed as string;
                            draft.data[idx].draft = undefined;
                          }
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
                          if (idx !== -1) {
                            draft.data[idx].payload = confirmed as string;
                            draft.data[idx].draft = undefined;
                          }
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

            refs.awaitingCommitRef.current = false;
            refs.awaitingCommitPayloadRef.current = null;
            setLastCommitAt(Date.now());
            setIsSaving(false);
            setLastSavedAt(new Date().toISOString());

            if (onRemoteCommit) onRemoteCommit();
          } else {
            refs.awaitingCommitRef.current = false;
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
  }, [
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
  ]);
};
