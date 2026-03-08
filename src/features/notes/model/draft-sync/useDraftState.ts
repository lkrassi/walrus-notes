import { useEffect, useRef, useState } from 'react';
import type { DraftPhase, DraftRefs } from './types';

export const useDraftState = (draft: string) => {
  const [draftPhase, setDraftPhaseState] = useState<DraftPhase>('IDLE');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastCommitAt, setLastCommitAt] = useState<number | null>(null);

  const lastEditAtRef = useRef<number | null>(null);
  const skipInitialSendRef = useRef<boolean>(true);
  const initialPayloadRef = useRef<string | null>(null);
  const suppressRemoteUntilRef = useRef<number | null>(null);
  const lastManualSendAtRef = useRef<number | null>(null);
  const prevSentRef = useRef<string | null>(null);
  const awaitingAckRef = useRef<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const awaitingCommitRef = useRef(false);
  const awaitingCommitPayloadRef = useRef<string | null>(null);
  const pendingCommitPayloadRef = useRef<string | null>(null);
  const commitRetryCountRef = useRef(0);
  const commitRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastCommittedPayloadRef = useRef<string | null>(null);
  const draftRef = useRef(draft);

  useEffect(() => {
    lastEditAtRef.current = Date.now();
  }, [draft]);

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

  const refsObjectRef = useRef<DraftRefs>({
    lastEditAtRef,
    skipInitialSendRef,
    initialPayloadRef,
    suppressRemoteUntilRef,
    lastManualSendAtRef,
    prevSentRef,
    awaitingAckRef,
    pendingRef,
    sendingRef,
    awaitingCommitRef,
    awaitingCommitPayloadRef,
    pendingCommitPayloadRef,
    commitRetryCountRef,
    commitRetryTimerRef,
    lastCommittedPayloadRef,
    draftRef,
  });

  const setDraftPhase = (next: DraftPhase) => {
    setDraftPhaseState(prev => (prev === next ? prev : next));
  };

  return {
    draftPhase,
    setDraftPhase,
    isSaving,
    setIsSaving,
    lastSavedAt,
    setLastSavedAt,
    lastCommitAt,
    setLastCommitAt,
    refs: refsObjectRef.current,
  };
};
