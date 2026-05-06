import { layoutApi } from '@/entities';
import type { Layout } from '@/entities/layout';
import { useWSContext } from '@/shared/lib/react/websocket';
import { useAppDispatch, useAppSelector } from '@/widgets/hooks';
import { useEffect, useRef } from 'react';
import type { UseDraftSyncOpts, UseDraftSyncReturn } from './draft-sync/types';
import { useDraftOrchestrator } from './draft-sync/useDraftOrchestrator';

type DispatchLike = (action: unknown) => unknown;
const EMPTY_LAYOUTS: Layout[] = [];

export const useDraftSync = ({
  noteId,
  draft,
  debounceMs = 800,
  autoSyncEnabled = true,
  onRemoteDraft,
  onRemoteCommit,
  initialPrevSent,
}: UseDraftSyncOpts): UseDraftSyncReturn => {
  const ctx = useWSContext();
  const ws = ctx;
  const warnedMissingProviderRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV && !ws && !warnedMissingProviderRef.current) {
      warnedMissingProviderRef.current = true;
    }
  }, [ws]);

  const dispatch = useAppDispatch() as DispatchLike;
  const storedDraft = useAppSelector(state =>
    noteId ? (state.drafts?.[noteId] ?? null) : null
  );

  const selectLayouts = layoutApi.endpoints.getMyLayouts.select();
  const layouts = useAppSelector(
    state =>
      selectLayouts(state as Parameters<typeof selectLayouts>[0])?.data?.data ??
      EMPTY_LAYOUTS
  ) as Layout[];

  return useDraftOrchestrator({
    noteId,
    draft,
    debounceMs,
    autoSyncEnabled,
    onRemoteDraft,
    onRemoteCommit,
    initialPrevSent,
    ws,
    storedDraft,
    layouts,
    dispatch,
  });
};

export type { UseDraftSyncOpts, UseDraftSyncReturn } from './draft-sync/types';
