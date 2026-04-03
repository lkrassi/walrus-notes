import { makeUpdateDraft, removeDraft, setDraft } from '@/entities';
import { useCallback } from 'react';
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
  const send = useCallback(
    (value: string) => {
      if (!ws || !noteId) {
        return false;
      }
      try {
        if (
          lastCommitAt != null &&
          refs.lastEditAtRef.current != null &&
          lastCommitAt >= refs.lastEditAtRef.current
        ) {
          try {
            dispatch(removeDraft({ noteId }));
          } catch (_e) {}
          setDraftPhase('IDLE');
          return false;
        }
      } catch (_e) {}

      if (
        refs.prevSentRef.current === value ||
        refs.awaitingAckRef.current === value
      ) {
        try {
          refs.suppressRemoteUntilRef.current = Date.now() + 3500;
        } catch (_e) {}
        return true;
      }

      if (refs.awaitingCommitRef.current) {
        refs.pendingRef.current = value;
        setDraftPhase('PENDING_UPDATE');
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}
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
          } catch (_e) {}
          refs.sendingRef.current = false;
          return true;
        }

        refs.pendingRef.current = value;
        setDraftPhase('PENDING_UPDATE');
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}

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
        refs.sendingRef.current = false;
        return false;
      } catch (_e) {
        try {
          dispatch(setDraft({ noteId, text: value }));
        } catch (_e) {}
        setIsSaving(false);
        refs.sendingRef.current = false;
        return false;
      }
    },
    [ws, noteId, lastCommitAt, refs, dispatch, setIsSaving, setDraftPhase]
  );

  return send;
};
