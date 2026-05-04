import { layoutApi } from '@/entities';
import type { Layout } from '@/entities/layout';
import { useWSContext } from '@/shared/lib/react/websocket';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UseDraftSyncOpts, UseDraftSyncReturn } from './draft-sync/types';
import { useDraftOrchestrator } from './draft-sync/useDraftOrchestrator';

type RootStateLike = {
  drafts?: Record<string, string>;
};

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

  const dispatch = useDispatch() as DispatchLike;
  const storedDraft = useSelector((state: RootStateLike) =>
    noteId ? (state.drafts?.[noteId] ?? null) : null
  );

  const selectLayouts = layoutApi.endpoints.getMyLayouts.select();
  const layouts = useSelector(
    (state: Parameters<typeof selectLayouts>[0]) =>
      selectLayouts(state)?.data?.data ?? EMPTY_LAYOUTS
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
