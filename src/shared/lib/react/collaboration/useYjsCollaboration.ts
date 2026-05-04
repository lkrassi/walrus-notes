import { buildYjsWsUrl, getUserColorById } from '@/shared/lib/core/yjsUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { type AwarenessUser, type CursorInfo, type UserInfo } from './types';

export const useYjsCollaboration = (
  noteId: string,
  userId: string,
  userName: string,
  onStatusChange?: (status: 'connected' | 'disconnected') => void
) => {
  const isPresenceDebug = import.meta.env.DEV;
  const logPresence = (message: string, extra?: Record<string, unknown>) => {
    if (!isPresenceDebug) return;

    if (extra) {
      console.log(`[yjs-presence][${noteId}][${userId}] ${message}`, extra);
      return;
    }

    console.log(`[yjs-presence][${noteId}][${userId}] ${message}`);
  };
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );
  const [ytext, setYtext] = useState<Y.Text | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const hasInitializedRef = useRef(false);
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
  const lastResolvedRemoteCursorRef = useRef<
    Map<
      number,
      { selectionStart: number; selectionEnd: number; updatedAt: number }
    >
  >(new Map());

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
    logPresence('send cursor awareness', {
      selectionStart: payload.selectionStart,
      selectionEnd: payload.selectionEnd,
      textLength: ytextCurrent.length,
    });
  }, [isPresenceDebug, noteId, userId]);

  const resolveAbsoluteIndex = useCallback(
    (relativeJson: unknown): number | null => {
      const ydoc = ydocRef.current;
      const text = ytextRef.current;
      if (!ydoc || !text || !relativeJson) return null;

      try {
        const relPos = Y.createRelativePositionFromJSON(
          relativeJson as Record<string, unknown>
        );
        const absolute = Y.createAbsolutePositionFromRelativePosition(
          relPos,
          ydoc
        );
        if (!absolute || typeof absolute.index !== 'number') {
          return null;
        }

        const maxIndex = text.length;
        return Math.max(0, Math.min(absolute.index, maxIndex));
      } catch (_e) {
        return null;
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
          logPresence('cursor throttled', {
            elapsed,
            throttleMs,
            delayedMs: throttleMs - elapsed,
          });
          return;
        }

        if (cursorTimeoutRef.current !== null) {
          window.clearTimeout(cursorTimeoutRef.current);
          cursorTimeoutRef.current = null;
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

    hasInitializedRef.current = false;
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
      logPresence('provider status', {
        status: event.status,
      });
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

      logPresence('provider sync received', {
        isSynced,
        textLength: ytextInstance.length,
      });

      hasInitializedRef.current = true;
      setIsContentLoaded(true);
      logPresence('content marked as loaded', {
        textLengthAfterSync: ytextInstance.length,
      });
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
            lastResolvedRemoteCursorRef.current.delete(clientId);
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

          const resolvedStart = resolveAbsoluteIndex(rawCursor.anchor);
          const resolvedEnd = resolveAbsoluteIndex(rawCursor.head);
          const previousResolved =
            lastResolvedRemoteCursorRef.current.get(clientId);
          const incomingUpdatedAt =
            typeof rawCursor.updatedAt === 'number'
              ? rawCursor.updatedAt
              : Date.now();

          let normalizedStart: number;
          let normalizedEnd: number;
          let effectiveUpdatedAt = incomingUpdatedAt;
          const isStaleAwarenessUpdate =
            !!previousResolved &&
            incomingUpdatedAt < previousResolved.updatedAt;

          if (isStaleAwarenessUpdate && previousResolved) {
            normalizedStart = previousResolved.selectionStart;
            normalizedEnd = previousResolved.selectionEnd;
            effectiveUpdatedAt = previousResolved.updatedAt;
            logPresence('ignored stale remote cursor awareness update', {
              clientId,
              incomingUpdatedAt,
              previousUpdatedAt: previousResolved.updatedAt,
              selectionStart: normalizedStart,
              selectionEnd: normalizedEnd,
            });
          } else if (
            typeof resolvedStart === 'number' &&
            typeof resolvedEnd === 'number'
          ) {
            normalizedStart = Math.min(resolvedStart, resolvedEnd);
            normalizedEnd = Math.max(resolvedStart, resolvedEnd);
          } else if (previousResolved) {
            normalizedStart = previousResolved.selectionStart;
            normalizedEnd = previousResolved.selectionEnd;
          } else {
            normalizedStart = Math.min(fallbackStart, fallbackEnd);
            normalizedEnd = Math.max(fallbackStart, fallbackEnd);
          }

          lastResolvedRemoteCursorRef.current.set(clientId, {
            selectionStart: normalizedStart,
            selectionEnd: normalizedEnd,
            updatedAt: effectiveUpdatedAt,
          });

          normalizedStates.set(clientId, {
            clientId,
            isLocal: clientId === localClientId,
            user: resolvedUser,
            cursor: {
              ...rawCursor,
              index: normalizedEnd,
              selectionStart: normalizedStart,
              selectionEnd: normalizedEnd,
              updatedAt: effectiveUpdatedAt,
            },
          });
        });

        const usersKey = Array.from(normalizedStates.values())
          .map(state => {
            const user = state.user;
            if (!user) return '';

            const cursor = state.cursor;
            const cursorKey = state.isLocal
              ? 'local-cursor'
              : cursor
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
        logPresence('awareness users changed', {
          usersCount: normalizedStates.size,
        });
      });
    };

    providerInstance.awareness.on('change', handleAwarenessChange);
    providerInstance.awareness.on('update', handleAwarenessChange);
    ytextInstance.observe(handleAwarenessChange);

    handleAwarenessChange();

    return () => {
      logPresence('collaboration cleanup', {
        lastTextLength: ytextInstance.length,
      });
      providerInstance.off('status', handleStatus);
      providerInstance.off('sync', handleSync);
      providerInstance.awareness.off('change', handleAwarenessChange);
      providerInstance.awareness.off('update', handleAwarenessChange);
      ytextInstance.unobserve(handleAwarenessChange);
      providerInstance.destroy();
      ydoc.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
      providerRef.current = null;
      lastResolvedRemoteCursorRef.current.clear();

      if (cursorRafRef.current !== null) {
        cancelAnimationFrame(cursorRafRef.current);
        cursorRafRef.current = null;
      }

      if (cursorTimeoutRef.current !== null) {
        window.clearTimeout(cursorTimeoutRef.current);
        cursorTimeoutRef.current = null;
      }
    };
  }, [noteId, resolveAbsoluteIndex, userId]);

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
