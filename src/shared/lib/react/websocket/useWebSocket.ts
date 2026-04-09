import type { WSEvent, WSEventName } from '@/shared/lib/core/ws';
import { useCallback, useEffect, useRef } from 'react';
import useReactWebSocket, { ReadyState } from 'react-use-websocket';

type Listener = (payload: unknown, raw?: WSEvent) => void;

interface UseWebSocketOptions {
  url?: string;
  userId?: string;
  reconnectInterval?: number;
}

export const useWebSocket = (opts: UseWebSocketOptions = {}) => {
  const { url = '', userId = '', reconnectInterval = 3000 } = opts;
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<WSEventName, Set<Listener>>>(new Map());
  const openCallbacks = useRef<Set<() => void>>(new Set());
  const wasConnectedRef = useRef(false);

  const getFullUrl = useCallback(() => {
    if (!url) return '';
    if (/user_id=/i.test(url)) return url;
    const sep = url.includes('?') ? '&' : '?';
    const full = `${url}${sep}user_id=${encodeURIComponent(userId)}`;
    return full;
  }, [url, userId]);

  const fullUrl = getFullUrl();

  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } =
    useReactWebSocket(
      fullUrl,
      {
        share: true,
        retryOnError: true,
        shouldReconnect: () => reconnectInterval > 0,
        reconnectAttempts: Number.POSITIVE_INFINITY,
        reconnectInterval: attempt => {
          const maxInterval = 60_000;
          const pow = Math.pow(2, Math.max(0, attempt - 1));
          const raw = Math.min(maxInterval, reconnectInterval * pow);
          const jitter = Math.floor(raw * 0.2);
          const delta = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
          return Math.max(1000, raw + delta);
        },
      },
      !!fullUrl
    );

  useEffect(() => {
    const socket = getWebSocket();
    wsRef.current = socket instanceof WebSocket ? socket : null;
  }, [getWebSocket, readyState]);

  useEffect(() => {
    const connected = readyState === ReadyState.OPEN;

    if (!wasConnectedRef.current && connected) {
      openCallbacks.current.forEach(cb => cb());
    }

    wasConnectedRef.current = connected;
  }, [readyState]);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    const parsed = lastJsonMessage as WSEvent;
    if (!parsed || typeof parsed.event !== 'string') {
      return;
    }

    if (parsed.event === 'PING') {
      sendJsonMessage({ event: 'PONG', payload: {} }, false);
      return;
    }

    const set = listenersRef.current.get(parsed.event);
    if (set) {
      set.forEach(listener => {
        try {
          listener(parsed.payload, parsed);
        } catch (e) {
          console.error('WebSocket listener callback failed', e);
        }
      });
    }
  }, [lastJsonMessage, sendJsonMessage]);

  const trySendOrQueue = useCallback(
    (eventObj: WSEvent) => {
      try {
        if (!eventObj || readyState !== ReadyState.OPEN) {
          return false;
        }

        sendJsonMessage(eventObj, false);
        return true;
      } catch (_e) {
        return false;
      }
    },
    [readyState, sendJsonMessage]
  );

  const subscribe = useCallback(
    (eventName: WSEventName, listener: Listener) => {
      let set = listenersRef.current.get(eventName);
      if (!set) {
        set = new Set();
        listenersRef.current.set(eventName, set);
      }

      set.add(listener);
      return () => set?.delete(listener);
    },
    []
  );

  const onOpen = useCallback(
    (cb: () => void) => {
      openCallbacks.current.add(cb);

      if (readyState === ReadyState.OPEN) {
        try {
          cb();
        } catch (e) {
          console.error('WebSocket onOpen callback failed', e);
        }
      }

      return () => openCallbacks.current.delete(cb);
    },
    [readyState]
  );

  return {
    trySendOrQueue,
    send: trySendOrQueue,
    subscribe,
    isConnected: readyState === ReadyState.OPEN,
    onOpen,
    wsRef,
  } as const;
};
