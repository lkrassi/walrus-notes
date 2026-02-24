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
  const hasOptimisticInitRef = useRef(false);
  const firstInitialContentRef = useRef<string | undefined>(undefined);
  const isFirstMountRef = useRef(true);
  const lastOnlineUsersKeyRef = useRef<string>('');
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!noteId || !userId) {
      return;
    }

    console.log('[YJS] Инициализация для noteId:', noteId, 'userId:', userId);

    // Обновляем initialContent при каждом входе в режим редактирования
    if (initialContent !== undefined) {
      firstInitialContentRef.current = initialContent;
      console.log(
        '[YJS] Сохранен initialContent, длина:',
        initialContent.length
      );
    }

    hasInitializedRef.current = false;
    hasOptimisticInitRef.current = false;
    setIsContentLoaded(false);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytextInstance = ydoc.getText('shared');

    setYtext(ytextInstance);

    console.log(
      '[YJS] Создан ytextInstance, начальная длина:',
      ytextInstance.length
    );

    // УБРАЛ оптимистичную вставку - будем ждать sync события
    // Это предотвращает дублирование у второго пользователя
    // if (ytextInstance.length === 0 && firstInitialContentRef.current) {
    //   hasOptimisticInitRef.current = true;
    //   ytextInstance.insert(0, firstInitialContentRef.current);
    //   setIsContentLoaded(true);
    // }

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
      console.log('[YJS] Status изменен:', event.status);
      setIsConnected(event.status === 'connected');

      if (event.status !== 'connecting') {
        onStatusChangeRef.current?.(
          event.status as 'connected' | 'disconnected'
        );
      }

      if (event.status === 'connected') {
        console.log('[YJS] Подключено, устанавливаем awareness');
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
      console.log(
        '[YJS] Sync событие, isSynced:',
        isSynced,
        'hasInitialized:',
        hasInitializedRef.current
      );

      if (!isSynced || hasInitializedRef.current) {
        return;
      }

      hasInitializedRef.current = true;

      console.log(
        '[YJS] После синхронизации, длина ytextInstance:',
        ytextInstance.length
      );

      if (ytextInstance.length > 0) {
        console.log('[YJS] Документ не пустой, контент уже есть на сервере');
        setIsContentLoaded(true);
        return;
      }

      console.log(
        '[YJS] Документ пустой, вставляем initialContent через 100мс'
      );
      setTimeout(() => {
        if (ytextInstance.length === 0 && firstInitialContentRef.current) {
          console.log(
            '[YJS] Вставляем initialContent, длина:',
            firstInitialContentRef.current.length
          );
          ytextInstance.insert(0, firstInitialContentRef.current);
        } else {
          console.log(
            '[YJS] Пропускаем вставку, ytextInstance.length:',
            ytextInstance.length
          );
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

        console.log(
          '[YJS] Awareness изменение, количество пользователей online:',
          states.size
        );

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

        console.log(
          '[YJS] Список пользователей изменился, обновляем состояние'
        );

        lastOnlineUsersKeyRef.current = usersKey;
        setOnlineUsers(new Map(states));
      });
    };

    providerInstance.awareness.on('change', handleAwarenessChange);

    console.log('[YJS] Все обработчики установлены, ждем событий');

    return () => {
      console.log('[YJS] Cleanup: отключаем обработчики и уничтожаем provider');
      providerInstance.off('status', handleStatus);
      providerInstance.off('sync', handleSync);
      providerInstance.awareness.off('change', handleAwarenessChange);
      providerInstance.destroy();
      ydoc.destroy();
      ydocRef.current = null;
    };
  }, [noteId, userId]);

  useEffect(() => {
    if (provider && userId) {
      const userColor = getUserColor(userId);
      provider.awareness.setLocalState({
        user: {
          id: userId,
          name: userName,
          color: userColor,
        },
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
  };
}
