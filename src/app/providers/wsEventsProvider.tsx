import type { RootState } from '@/app/store';
import { store } from '@/app/store';
import { layoutApi } from '@/entities/layout';
import { notesApi } from '@/entities/note';
import { closeLayoutTabs, closeTabsByItemId } from '@/entities/tab';
import { useWSContext } from '@/shared/lib/react/websocket';
import { useAppDispatch, useAppSelector } from '@/widgets/hooks';
import { useFileTree } from '@/widgets/hooks/FileTreeContext';
import { useEffect, useRef, type FC, type ReactNode } from 'react';

const WS_EVENTS = {
  DELETE_LAYOUT: 'DELETE_LAYOUT',
  UPDATE_LAYOUT: 'UPDATE_LAYOUT',
  CREATE_NOTE: 'CREATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  CHANGE_NOTE_POSITION: 'CHANGE_NOTE_POSITION',
  CHANGE_NOTE_LINKS: 'CHANGE_NOTE_LINKS',
  DRAG_NOTE: 'DRAG_NOTE',
} as const;

interface ServerEventPayload {
  layoutId?: string;
  noteId?: string;
  firstNoteId?: string;
  toLayoutId?: string;
  actorId?: string;
}

/**
 * Handles WebSocket events from server.
 * Applies local cache invalidation and UI updates based on event type.
 * Must be mounted INSIDE FileTreeProvider context.
 */
export const WSEventHandlerComponent: FC = () => {
  const ws = useWSContext();
  const dispatch = useAppDispatch();
  const fileTree = useFileTree();
  const currentUserId = useAppSelector(state => state.user.profile?.id);

  // grab a snapshot of the redux state to inspect cached queries when needed
  const rootState = store.getState() as RootState;
  const graphEventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const graphEventIdsRef = useRef<Set<string>>(new Set());

  if (typeof window !== 'undefined') {
    (window as Window & { _wsDebug?: unknown })._wsDebug = {
      currentUserId,
      shouldIgnoreEvent: (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return false;
        const typed = payload as ServerEventPayload;
        return typed.actorId === currentUserId;
      },
    };
  }

  const shouldIgnoreEvent = (payload: unknown): boolean => {
    if (!payload || typeof payload !== 'object') return false;
    const typed = payload as ServerEventPayload;
    if (!typed.actorId || !currentUserId) return false;
    return typed.actorId === currentUserId;
  };

  const getIdFromPayload = (
    payload: unknown,
    keys: string[]
  ): string | null => {
    if (!payload || typeof payload !== 'object') return null;
    const typed = payload as ServerEventPayload;
    for (const key of keys) {
      const val = typed[key as keyof ServerEventPayload];
      if (typeof val === 'string' && val.trim()) return val;
    }
    return null;
  };

  const scheduleGraphEventInvalidation = (noteId: string) => {
    graphEventIdsRef.current.add(noteId);

    if (graphEventTimerRef.current) {
      clearTimeout(graphEventTimerRef.current);
    }

    graphEventTimerRef.current = setTimeout(() => {
      const ids = Array.from(graphEventIdsRef.current);
      graphEventIdsRef.current.clear();

      try {
        const layoutsCache =
          layoutApi.endpoints.getMyLayouts.select()(rootState);
        const layouts = layoutsCache.data?.data || [];

        const layoutIdsToInvalidate = new Set<string>();

        for (const l of layouts) {
          try {
            const posedCache = notesApi.endpoints.getPosedNotes.select({
              layoutId: l.id,
            })(rootState);
            const posedContains = posedCache.data?.data?.some(
              (n: { id: string }) => ids.includes(n.id)
            );
            if (posedContains) layoutIdsToInvalidate.add(l.id);

            const notesCache = notesApi.endpoints.getNotes.select({
              layoutId: l.id,
              page: 1,
            })(rootState);
            const notesContains = notesCache.data?.data?.some(
              (n: { id: string }) => ids.includes(n.id)
            );
            if (notesContains) layoutIdsToInvalidate.add(l.id);
          } catch {
            // ignore
          }
        }

        if (layoutIdsToInvalidate.size > 0) {
          const tags: Array<{ type: 'Notes'; id: string }> = [];
          for (const lid of layoutIdsToInvalidate) {
            tags.push({ type: 'Notes', id: `posed-${lid}` });
            tags.push({ type: 'Notes', id: `unposed-${lid}` });
            tags.push({ type: 'Notes', id: lid });
          }
          dispatch(notesApi.util.invalidateTags(tags));
        } else {
          dispatch(notesApi.util.invalidateTags(['Notes']));
        }
      } catch {
        dispatch(notesApi.util.invalidateTags(['Notes']));
      }

      console.debug(
        '[WSEventsHandler] Batch invalidated Notes after graph events for noteIds:',
        ids
      );
    }, 300);
  };

  const handleDeleteLayout = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const layoutId = getIdFromPayload(payload, ['layoutId']);
    if (!layoutId) {
      console.warn(
        '[WSEventsHandler] DELETE_LAYOUT: missing layoutId',
        payload
      );
      return;
    }

    console.debug('[WSEventsHandler] DELETE_LAYOUT', layoutId);
    fileTree.removeLayoutFromTree(layoutId);
    dispatch(closeLayoutTabs(layoutId));
  };

  const handleUpdateLayout = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const layoutId = getIdFromPayload(payload, ['layoutId']);
    if (!layoutId) {
      console.warn(
        '[WSEventsHandler] UPDATE_LAYOUT: missing layoutId',
        payload
      );
      return;
    }

    console.debug('[WSEventsHandler] UPDATE_LAYOUT', layoutId);
    dispatch(layoutApi.util.invalidateTags(['Layouts', 'Notes']));
  };

  const handleCreateNote = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    const layoutId = getIdFromPayload(payload, ['layoutId']);
    if (!noteId || !layoutId) {
      console.warn(
        '[WSEventsHandler] CREATE_NOTE: missing noteId or layoutId',
        payload
      );
      return;
    }

    console.debug(
      '[WSEventsHandler] CREATE_NOTE',
      noteId,
      'in layout',
      layoutId
    );

    dispatch(
      notesApi.util.invalidateTags([
        { type: 'Notes', id: `posed-${layoutId}` },
        { type: 'Notes', id: `unposed-${layoutId}` },
        { type: 'Notes', id: layoutId },
      ])
    );
  };

  const handleDeleteNote = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    if (!noteId) {
      console.warn('[WSEventsHandler] DELETE_NOTE: missing noteId', payload);
      return;
    }

    console.debug('[WSEventsHandler] DELETE_NOTE', noteId);
    fileTree.removeNoteFromTree(noteId);
    dispatch(closeTabsByItemId({ itemId: noteId, itemType: 'note' }));
  };

  const handleUpdateNote = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    const layoutId = getIdFromPayload(payload, ['layoutId']);
    if (!noteId) {
      console.warn('[WSEventsHandler] UPDATE_NOTE: missing noteId', payload);
      return;
    }

    console.debug('[WSEventsHandler] UPDATE_NOTE', noteId, 'layout', layoutId);

    if (layoutId) {
      dispatch(
        notesApi.util.invalidateTags([
          { type: 'Notes', id: `posed-${layoutId}` },
          { type: 'Notes', id: `unposed-${layoutId}` },
          { type: 'Notes', id: layoutId },
        ])
      );
      return;
    }

    dispatch(notesApi.util.invalidateTags(['Notes']));
  };

  const handleChangeNotePosition = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    const layoutId = getIdFromPayload(payload, ['layoutId']);

    if (layoutId) {
      console.debug(
        `[WSEventsHandler] CHANGE_NOTE_POSITION: Invalidating for layout ${layoutId}`
      );
      dispatch(
        notesApi.util.invalidateTags([
          { type: 'Notes', id: `posed-${layoutId}` },
          { type: 'Notes', id: `unposed-${layoutId}` },
        ])
      );
      return;
    }

    if (noteId) {
      console.debug(
        '[WSEventsHandler] CHANGE_NOTE_POSITION for noteId',
        noteId
      );
      scheduleGraphEventInvalidation(noteId);
      return;
    }

    console.warn(
      '[WSEventsHandler] CHANGE_NOTE_POSITION: missing both layoutId and noteId',
      payload
    );
  };

  const handleChangeNoteLinks = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    const layoutId = getIdFromPayload(payload, ['layoutId']);

    console.debug('[WSEventsHandler] CHANGE_NOTE_LINKS received:', {
      noteId,
      layoutId,
      fullPayload: payload,
    });

    if (layoutId) {
      console.debug(
        `[WSEventsHandler] Invalidating getPosedNotes/getUnposedNotes for layout ${layoutId}`
      );
      const tags = [
        { type: 'Notes' as const, id: `posed-${layoutId}` },
        { type: 'Notes' as const, id: `unposed-${layoutId}` },
      ];
      dispatch(notesApi.util.invalidateTags(tags));
      return;
    }

    if (noteId) {
      console.debug('[WSEventsHandler] CHANGE_NOTE_LINKS for noteId', noteId);
      scheduleGraphEventInvalidation(noteId);
      return;
    }

    console.warn(
      '[WSEventsHandler] CHANGE_NOTE_LINKS: missing both layoutId and noteId',
      payload
    );
  };

  const handleDragNote = (payload: unknown) => {
    if (shouldIgnoreEvent(payload)) return;
    const noteId = getIdFromPayload(payload, ['noteId']);
    const toLayoutId = getIdFromPayload(payload, ['toLayoutId']);
    if (!noteId) {
      console.warn('[WSEventsHandler] DRAG_NOTE: missing noteId', payload);
      return;
    }

    console.debug('[WSEventsHandler] DRAG_NOTE', noteId, 'to', toLayoutId);

    if (toLayoutId) {
      dispatch(
        notesApi.util.invalidateTags([
          { type: 'Notes', id: `posed-${toLayoutId}` },
          { type: 'Notes', id: `unposed-${toLayoutId}` },
          { type: 'Notes', id: toLayoutId },
        ])
      );
      return;
    }

    dispatch(notesApi.util.invalidateTags(['Notes']));
  };

  useEffect(() => {
    if (!ws || !currentUserId) {
      return;
    }

    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      ws.subscribe(WS_EVENTS.DELETE_LAYOUT, handleDeleteLayout)
    );
    unsubscribers.push(
      ws.subscribe(WS_EVENTS.UPDATE_LAYOUT, handleUpdateLayout)
    );
    unsubscribers.push(ws.subscribe(WS_EVENTS.CREATE_NOTE, handleCreateNote));
    unsubscribers.push(ws.subscribe(WS_EVENTS.DELETE_NOTE, handleDeleteNote));
    unsubscribers.push(ws.subscribe(WS_EVENTS.UPDATE_NOTE, handleUpdateNote));
    unsubscribers.push(
      ws.subscribe(WS_EVENTS.CHANGE_NOTE_POSITION, handleChangeNotePosition)
    );
    unsubscribers.push(
      ws.subscribe(WS_EVENTS.CHANGE_NOTE_LINKS, handleChangeNoteLinks)
    );
    unsubscribers.push(ws.subscribe(WS_EVENTS.DRAG_NOTE, handleDragNote));

    console.debug('[WSEventsHandler] Subscribed to all WS events');

    return () => {
      unsubscribers.forEach(unsub => unsub());

      if (graphEventTimerRef.current) {
        clearTimeout(graphEventTimerRef.current);
      }

      console.debug('[WSEventsHandler] Unsubscribed from all WS events');
    };
  }, [ws, currentUserId, dispatch, fileTree]);

  return null;
};

interface WSEventsProviderProps {
  children: ReactNode;
}

export const WSEventsProvider: FC<WSEventsProviderProps> = ({ children }) => {
  return (
    <>
      <WSEventHandlerComponent />
      {children}
    </>
  );
};
