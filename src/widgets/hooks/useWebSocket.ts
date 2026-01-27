import { useCallback, useEffect, useRef, useState } from 'react';
import type { WSEvent, WSEventName } from 'shared/model/ws';

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
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<number | null>(null);
  const connectTimer = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  const getFullUrl = useCallback(() => {
    if (!url) return '';
    if (/user_id=/i.test(url)) return url;
    const sep = url.includes('?') ? '&' : '?';
    const full = `${url}${sep}user_id=${encodeURIComponent(userId)}`;
    return full;
  }, [url, userId]);

  const connect = useCallback(() => {
    const full = getFullUrl();
    if (!full) {
      return;
    }

    const wsUrl = full.replace(/^http/, 'ws');

    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const DELAY = 50;
    if (connectTimer.current) window.clearTimeout(connectTimer.current);
    connectTimer.current = window.setTimeout(() => {
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (wsRef.current !== socket) return;
          attemptsRef.current = 0;
          setIsConnected(true);
          openCallbacks.current.forEach(cb => cb());
        };

        socket.onmessage = ev => {
          try {
            const parsed: WSEvent = JSON.parse(ev.data);
            if (parsed && parsed.event === 'PING') {
              try {
                if (
                  wsRef.current === socket &&
                  socket.readyState === WebSocket.OPEN
                ) {
                  socket.send(JSON.stringify({ event: 'PONG', payload: {} }));
                }
              } catch (_e) {}
            }
            const set = listenersRef.current.get(parsed.event);
            if (set) {
              set.forEach(l => {
                try {
                  l(parsed.payload, parsed);
                } catch (_e) {}
              });
            }
          } catch (_e) {}
        };

        socket.onclose = _ev => {
          if (wsRef.current !== socket) return;
          setIsConnected(false);
          if (reconnectInterval > 0) {
            if (reconnectTimer.current)
              window.clearTimeout(reconnectTimer.current);
            attemptsRef.current = Math.min(30, attemptsRef.current + 1);
            const base = reconnectInterval;
            const maxInterval = 60_000;
            const pow = Math.pow(2, Math.max(0, attemptsRef.current - 1));
            const raw = Math.min(maxInterval, base * pow);
            const jitter = Math.floor(raw * 0.2);
            const delta = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
            const next = Math.max(1000, raw + delta);
            reconnectTimer.current = window.setTimeout(
              () => connect(),
              next
            ) as unknown as number;
          }
        };

        socket.onerror = _ev => {
          if (wsRef.current !== socket) return;
        };
      } catch (_e) {}
    }, DELAY) as unknown as number;
  }, [getFullUrl, reconnectInterval]);

  useEffect(() => {
    if (getFullUrl()) connect();
    return () => {
      if (connectTimer.current) window.clearTimeout(connectTimer.current);
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      try {
        wsRef.current?.close();
      } catch (_e) {}
      wsRef.current = null;
    };
  }, [connect, getFullUrl]);

  const trySendOrQueue = useCallback((eventObj: WSEvent) => {
    try {
      const ws = wsRef.current;
      const data = JSON.stringify(eventObj);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        return true;
      }
      return false;
    } catch (_e) {
      return false;
    }
  }, []);

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

  const onOpen = useCallback((cb: () => void) => {
    openCallbacks.current.add(cb);
    return () => openCallbacks.current.delete(cb);
  }, []);

  return {
    trySendOrQueue,
    send: trySendOrQueue,
    subscribe,
    isConnected,
    connect,
    onOpen,
    wsRef,
  } as const;
};
