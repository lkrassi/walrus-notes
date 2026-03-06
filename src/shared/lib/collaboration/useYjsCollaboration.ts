import { useCallback, useEffect, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { type AwarenessUser, type CursorInfo, type UserInfo } from './types';
import { buildYjsWsUrl, getUserColorById } from './yjsUtils';

export const useYjsCollaboration = (
  noteId: string,
  userId: string,
  userName: string,
  initialContent?: string,
  onStatusChange?: (status: 'connected' | 'disconnected') => void
) => {
  const isPresenceDebug = import.meta.env.DEV;
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );
  const [ytext, setYtext] = useState<Y.Text | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const hasInitializedRef = useRef(false);
  const hasOptimisticInitRef = useRef(false);
  const firstInitialContentRef = useRef<string | undefined>(undefined);
  const lastOnlineUsersKeyRef = useRef<string>('');
  const onStatusChangeRef = useRef(onStatusChange);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const cursorPayloadRef = useRef<{
    selectionStart: number;
    selectionEnd: number;
  } | null>(null);
  const cursorRafRef = useRef<number | null>(null);
  const lastCursorSentAtRef = useRef(0);
  const cursorTimeoutRef = useRef<number | null>(null);

  const sendCursorNow = useCallback(() => {
    const payload = cursorPayloadRef.current;
    if (!payload || !providerRef.current || !ytextRef.current) {
      return;
    }

    const now = Date.now();
    lastCursorSentAtRef.current = now;

    const ytextCurrent = ytextRef.current;
    const anchor = Y.relativePositionToJSON(
      Y.createRelativePositionFromTypeIndex(
        ytextCurrent,
        payload.selectionStart
      )
    );
    const head = Y.relativePositionToJSON(
      Y.createRelativePositionFromTypeIndex(ytextCurrent, payload.selectionEnd)
    );

    providerRef.current.awareness.setLocalStateField('cursor', {
      index: payload.selectionEnd,
      selectionStart: payload.selectionStart,
      selectionEnd: payload.selectionEnd,
      anchor,
      head,
      updatedAt: now,
    } as CursorInfo);

    if (isPresenceDebug) {
      console.info('[PresenceDebug][sendCursorNow]', {
        noteId,
        userId,
        selectionStart: payload.selectionStart,
        selectionEnd: payload.selectionEnd,
        localClientId: providerRef.current.awareness.clientID,
        connected: providerRef.current.wsconnected,
      });
    }
  }, [isPresenceDebug, noteId, userId]);

  const resolveAbsoluteIndex = useCallback(
    (relativeJson: unknown, fallback: number): number => {
      const ydoc = ydocRef.current;
      const text = ytextRef.current;
      if (!ydoc || !text) return fallback;

      try {
        const relPos = Y.createRelativePositionFromJSON(
          relativeJson as Record<string, unknown>
        );
        const absolute = Y.createAbsolutePositionFromRelativePosition(
          relPos,
          ydoc
        );
        if (!absolute || typeof absolute.index !== 'number') {
          return fallback;
        }

        const maxIndex = text.length;
        return Math.max(0, Math.min(absolute.index, maxIndex));
      } catch (_e) {
        return fallback;
      }
    },
    []
  );

  const updateCursorAwareness = useCallback(
    (selectionStart: number, selectionEnd: number) => {
      const providerInstance = providerRef.current;
      const text = ytextRef.current;
      if (!providerInstance || !text || !userId) return;

      const maxLength = text.length;
      const start = Math.max(0, Math.min(selectionStart, maxLength));
      const end = Math.max(0, Math.min(selectionEnd, maxLength));

      cursorPayloadRef.current = {
        selectionStart: start,
        selectionEnd: end,
      };

      if (cursorRafRef.current !== null) {
        return;
      }

      cursorRafRef.current = requestAnimationFrame(() => {
        cursorRafRef.current = null;

        if (
          !cursorPayloadRef.current ||
          !providerRef.current ||
          !ytextRef.current
        ) {
          return;
        }

        const now = Date.now();
        const elapsed = now - lastCursorSentAtRef.current;
        const throttleMs = 120;

        if (elapsed < throttleMs) {
          if (cursorTimeoutRef.current !== null) {
            window.clearTimeout(cursorTimeoutRef.current);
          }

          cursorTimeoutRef.current = window.setTimeout(() => {
            cursorTimeoutRef.current = null;
            sendCursorNow();
          }, throttleMs - elapsed);
          return;
        }

        sendCursorNow();
      });
    },
    [sendCursorNow, userId]
  );

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!noteId || !userId) {
      return;
    }

    if (initialContent !== undefined) {
      firstInitialContentRef.current = initialContent;
    }

    hasInitializedRef.current = false;
    hasOptimisticInitRef.current = false;
    setIsContentLoaded(false);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytextInstance = ydoc.getText('shared');

    setYtext(ytextInstance);
    ytextRef.current = ytextInstance;

    const wsUrl = buildYjsWsUrl();

    const providerInstance = new WebsocketProvider(wsUrl, noteId, ydoc, {
      params: {
        user_id: userId,
      },
    });
    setProvider(providerInstance);
    providerRef.current = providerInstance;

    providerInstance.awareness.setLocalState({
      user: {
        id: userId,
        name: userName,
        color: getUserColorById(userId),
      },
    });

    const handleStatus = (event: {
      status: 'connected' | 'disconnected' | 'connecting';
    }) => {
      setIsConnected(event.status === 'connected');

      if (event.status !== 'connecting') {
        onStatusChangeRef.current?.(
          event.status as 'connected' | 'disconnected'
        );
      }

      if (event.status === 'connected') {
        const localCursor =
          (providerInstance.awareness.getLocalState() as AwarenessUser | null)
            ?.cursor || undefined;

        providerInstance.awareness.setLocalState({
          user: {
            id: userId,
            name: userName,
            color: getUserColorById(userId),
          },
          cursor: localCursor,
        });
      }
    };

    const handleSync = (isSynced: boolean) => {
      if (!isSynced || hasInitializedRef.current) {
        return;
      }

      hasInitializedRef.current = true;

      setIsContentLoaded(true);
    };

    providerInstance.on('status', handleStatus);
    providerInstance.on('sync', handleSync);

    const pendingAwarenessFrame = { id: null as number | null };

    const handleAwarenessChange = () => {
      if (pendingAwarenessFrame.id !== null) {
        return;
      }

      pendingAwarenessFrame.id = requestAnimationFrame(() => {
        pendingAwarenessFrame.id = null;

        const states = providerInstance.awareness.getStates() as Map<
          number,
          AwarenessUser & { cursor?: CursorInfo }
        >;

        const normalizedStates = new Map<number, AwarenessUser>();
        const localClientId = providerInstance.awareness.clientID;

        states.forEach((state, clientId) => {
          const rawUser = state.user;
          if (!rawUser?.id) {
            return;
          }

          const resolvedUser: UserInfo = {
            id: rawUser.id,
            name: rawUser.name || 'Anonymous',
            color: rawUser.color || getUserColorById(rawUser.id),
          };

          const rawCursor = state.cursor;
          if (!rawCursor) {
            normalizedStates.set(clientId, {
              clientId,
              isLocal: clientId === localClientId,
              user: resolvedUser,
            });
            return;
          }

          const fallbackStart = Math.max(
            0,
            Math.min(rawCursor.selectionStart ?? 0, ytextInstance.length)
          );
          const fallbackEnd = Math.max(
            0,
            Math.min(
              rawCursor.selectionEnd ?? fallbackStart,
              ytextInstance.length
            )
          );

          const absoluteStart = resolveAbsoluteIndex(
            rawCursor.anchor,
            fallbackStart
          );
          const absoluteEnd = resolveAbsoluteIndex(rawCursor.head, fallbackEnd);

          const normalizedStart = Math.min(absoluteStart, absoluteEnd);
          const normalizedEnd = Math.max(absoluteStart, absoluteEnd);

          normalizedStates.set(clientId, {
            clientId,
            isLocal: clientId === localClientId,
            user: resolvedUser,
            cursor: {
              ...rawCursor,
              index: normalizedEnd,
              selectionStart: normalizedStart,
              selectionEnd: normalizedEnd,
            },
          });
        });

        const usersKey = Array.from(normalizedStates.values())
          .map(state => {
            const user = state.user;
            if (!user) return '';

            const cursor = state.cursor;
            const cursorKey = cursor
              ? `${cursor.selectionStart}:${cursor.selectionEnd}`
              : 'no-cursor';

            return `${state.clientId ?? ''}:${user.id}:${user.name}:${user.color ?? ''}:${cursorKey}`;
          })
          .filter(Boolean)
          .sort()
          .join('|');

        if (usersKey === lastOnlineUsersKeyRef.current) {
          return;
        }

        lastOnlineUsersKeyRef.current = usersKey;
        setOnlineUsers(normalizedStates);

        if (isPresenceDebug) {
          const dump = Array.from(normalizedStates.values()).map(state => ({
            clientId: state.clientId,
            isLocal: state.isLocal,
            userId: state.user?.id,
            userName: state.user?.name,
            hasCursor: Boolean(state.cursor),
            cursor: state.cursor
              ? {
                  start: state.cursor.selectionStart,
                  end: state.cursor.selectionEnd,
                  index: state.cursor.index,
                  updatedAt: state.cursor.updatedAt,
                }
              : null,
          }));

          console.info('[PresenceDebug][awareness:normalized]', {
            noteId,
            userId,
            localClientId,
            users: dump,
          });
        }
      });
    };

    providerInstance.awareness.on('change', handleAwarenessChange);
    providerInstance.awareness.on('update', handleAwarenessChange);

    handleAwarenessChange();

    return () => {
      providerInstance.off('status', handleStatus);
      providerInstance.off('sync', handleSync);
      providerInstance.awareness.off('change', handleAwarenessChange);
      providerInstance.awareness.off('update', handleAwarenessChange);
      providerInstance.destroy();
      ydoc.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
      providerRef.current = null;

      if (cursorRafRef.current !== null) {
        cancelAnimationFrame(cursorRafRef.current);
        cursorRafRef.current = null;
      }

      if (cursorTimeoutRef.current !== null) {
        window.clearTimeout(cursorTimeoutRef.current);
        cursorTimeoutRef.current = null;
      }
    };
  }, [isPresenceDebug, noteId, resolveAbsoluteIndex, userId, userName]);

  useEffect(() => {
    if (provider && userId) {
      const localCursor =
        (provider.awareness.getLocalState() as AwarenessUser | null)?.cursor ||
        undefined;

      provider.awareness.setLocalState({
        user: {
          id: userId,
          name: userName,
          color: getUserColorById(userId),
        },
        cursor: localCursor,
      });
    }
  }, [userName, userId, provider]);

  return {
    ydoc: ydocRef.current,
    ytext,
    provider,
    isConnected,
    onlineUsers,
    isContentLoaded,
    updateCursorAwareness,
  };
};
