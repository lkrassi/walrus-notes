import type { AppDispatch, RootState } from '@/app/store';
import type { Notification } from '@/entities';
import {
  addNotification,
  clearAllNotifications,
  removeNotification,
} from '@/entities';
import { normalizeMessage } from '@/shared/model';
import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const lastMessagesRef = useRef<Map<string, number>>(new Map());
  const MAX_CACHED_MESSAGES = 500;
  const CACHE_TTL = 5 * 60 * 1000;

  const cleanupOldMessages = useCallback(() => {
    const now = Date.now();
    for (const [key, timestamp] of lastMessagesRef.current.entries()) {
      if (now - timestamp > CACHE_TTL) {
        lastMessagesRef.current.delete(key);
      }
    }

    if (lastMessagesRef.current.size > MAX_CACHED_MESSAGES) {
      const entriesToDelete =
        lastMessagesRef.current.size - MAX_CACHED_MESSAGES;
      let deleted = 0;
      for (const key of lastMessagesRef.current.keys()) {
        if (deleted >= entriesToDelete) break;
        lastMessagesRef.current.delete(key);
        deleted++;
      }
    }
  }, []);

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      cleanupOldMessages();

      const normalized = normalizeMessage(notification.message);
      const messageKey = `${notification.type}:${normalized}`;

      if (lastMessagesRef.current.has(messageKey)) {
        return;
      }

      const alreadyShown = notifications.some(n => {
        const existing = normalizeMessage(n.message);
        return (
          existing === normalized ||
          existing.includes(normalized) ||
          normalized.includes(existing)
        );
      });

      if (alreadyShown) return;

      lastMessagesRef.current.set(messageKey, Date.now());
      dispatch(addNotification({ ...notification, origin: 'ui' }));

      if (notification.duration) {
        setTimeout(() => {
          lastMessagesRef.current.delete(messageKey);
        }, notification.duration + 1000);
      }
    },
    [dispatch, notifications, cleanupOldMessages]
  );

  const hideNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const clearNotifications = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  const showSuccess = useCallback(
    (message: string, _title?: string) => {
      showNotification({
        type: 'success',
        message,
        duration: 5000,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, _title?: string) => {
      showNotification({
        type: 'error',
        message,
        duration: 7000,
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, _title?: string) => {
      showNotification({
        type: 'warning',
        message,
        duration: 5000,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, _title?: string) => {
      showNotification({
        type: 'info',
        message,
        duration: 4000,
      });
    },
    [showNotification]
  );

  const forceShowNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      dispatch(addNotification(notification));
    },
    [dispatch]
  );

  return {
    notifications,
    showNotification,
    hideNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    forceShowNotification,
  };
};
