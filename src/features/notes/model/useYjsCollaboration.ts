import { useEffect, useRef, useState } from 'react';
import { getUserColor } from 'shared/lib/colorUtils';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { buildYjsWsUrl } from '../lib/yjs/yjsUtils';

export interface UserInfo {
  id: string;
  name: string;
  color: string;
}

export interface AwarenessUser {
  user: UserInfo;
}

export function useYjsCollaboration(
  noteId: string,
  userId: string,
  userName: string,
  initialContent?: string,
  onStatusChange?: (status: 'connected' | 'disconnected') => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );
  const [ytext, setYtext] = useState<Y.Text | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const hasInitializedRef = useRef(false);
  const firstInitialContentRef = useRef<string | undefined>(undefined);
  const isFirstMountRef = useRef(true);
  const lastOnlineUsersKeyRef = useRef<string>('');

  useEffect(() => {
    if (!noteId || !userId) {
      return;
    }

    if (isFirstMountRef.current && initialContent !== undefined) {
      firstInitialContentRef.current = initialContent;
      isFirstMountRef.current = false;
    }

    hasInitializedRef.current = false;
    setIsContentLoaded(false);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytextInstance = ydoc.getText('shared');

    setYtext(ytextInstance);

    const wsUrl = buildYjsWsUrl();

    const providerInstance = new WebsocketProvider(wsUrl, noteId, ydoc, {
      params: {
        user_id: userId,
      },
    });
    setProvider(providerInstance);

    const userColor = getUserColor(userId);

    providerInstance.awareness.setLocalState({
      user: {
        id: userId,
        name: userName,
        color: userColor,
      },
    });

    const handleStatus = (event: {
      status: 'connected' | 'disconnected' | 'connecting';
    }) => {
      setIsConnected(event.status === 'connected');

      if (event.status !== 'connecting') {
        onStatusChange?.(event.status as 'connected' | 'disconnected');
      }

      if (event.status === 'connected') {
        providerInstance.awareness.setLocalState({
          user: {
            id: userId,
            name: userName,
            color: userColor,
          },
        });
      }
    };

    const handleSync = (isSynced: boolean) => {
      if (!isSynced || hasInitializedRef.current) {
        return;
      }

      hasInitializedRef.current = true;

      if (ytextInstance.length > 0) {
        setIsContentLoaded(true);
        return;
      }

      setTimeout(() => {
        if (ytextInstance.length === 0 && firstInitialContentRef.current) {
          ytextInstance.insert(0, firstInitialContentRef.current);
        }
        setIsContentLoaded(true);
      }, 100);
    };

    providerInstance.on('status', handleStatus);
    providerInstance.on('sync', handleSync);

    const pendingAwarenessFrame = { id: 0 as number | null };

    const handleAwarenessChange = () => {
      if (pendingAwarenessFrame.id !== null) {
        return;
      }

      pendingAwarenessFrame.id = requestAnimationFrame(() => {
        pendingAwarenessFrame.id = null;

        const states = providerInstance.awareness.getStates() as Map<
          number,
          AwarenessUser
        >;
        const usersKey = Array.from(states.values())
          .map(state => {
            const user = state.user;
            if (!user) return '';
            return `${user.id}:${user.name}:${user.color}`;
          })
          .filter(Boolean)
          .sort()
          .join('|');

        if (usersKey === lastOnlineUsersKeyRef.current) {
          return;
        }

        lastOnlineUsersKeyRef.current = usersKey;
        setOnlineUsers(new Map(states));
      });
    };

    providerInstance.awareness.on('change', handleAwarenessChange);

    return () => {
      providerInstance.off('status', handleStatus);
      providerInstance.off('sync', handleSync);
      providerInstance.awareness.off('change', handleAwarenessChange);
      providerInstance.destroy();
      ydoc.destroy();
      ydocRef.current = null;
    };
  }, [noteId, userId, userName, onStatusChange]);

  return {
    ydoc: ydocRef.current,
    ytext,
    provider,
    isConnected,
    onlineUsers,
    isContentLoaded,
  };
}
