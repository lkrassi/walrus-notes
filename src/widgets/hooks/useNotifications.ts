import type { Notification } from 'app/store/slices/notificationsSlice';
import {
  addNotification,
  clearAllNotifications,
  removeNotification,
} from 'app/store/slices/notificationsSlice';
import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    state => state.notifications.notifications
  );

  const lastMessagesRef = useRef<Set<string>>(new Set());

  const normalizeMessage = (msg: string) =>
    msg
      .replace(/\s+/g, ' ')
      .replace(/request error[:\s-]*/i, '')
      .trim()
      .toLowerCase();

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
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

      lastMessagesRef.current.add(messageKey);

      if (lastMessagesRef.current.size > 100) {
        const firstKey = Array.from(lastMessagesRef.current)[0];
        lastMessagesRef.current.delete(firstKey);
      }

      dispatch(addNotification({ ...(notification as any), origin: 'ui' }));

      if (notification.duration) {
        setTimeout(() => {
          lastMessagesRef.current.delete(messageKey);
        }, notification.duration + 1000);
      }
    },
    [dispatch, notifications]
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
    (message: string, title?: string) => {
      showNotification({
        type: 'success',
        message,
        duration: 5000,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'error',
        message,
        duration: 7000,
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'warning',
        message,
        duration: 5000,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
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
