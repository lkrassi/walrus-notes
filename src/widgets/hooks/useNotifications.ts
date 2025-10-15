import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import type { Notification } from 'widgets/model/stores/slices/notificationsSlice';
import {
  addNotification,
  clearAllNotifications,
  removeNotification,
} from 'widgets/model/stores/slices/notificationsSlice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.notifications.notifications,
  );

  const lastMessagesRef = useRef<Set<string>>(new Set());

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const messageKey = `${notification.type}:${notification.message}`;

      if (lastMessagesRef.current.has(messageKey)) {
        return;
      }

      lastMessagesRef.current.add(messageKey);

      if (lastMessagesRef.current.size > 20) {
        const firstKey = Array.from(lastMessagesRef.current)[0];
        lastMessagesRef.current.delete(firstKey);
      }

      dispatch(addNotification(notification));

      if (notification.duration) {
        setTimeout(() => {
          lastMessagesRef.current.delete(messageKey);
        }, notification.duration + 1000);
      }
    },
    [dispatch],
  );

  const hideNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch],
  );

  const clearNotifications = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'success',
        title: title || 'УСПЕХ',
        message,
        duration: 5000,
      });
    },
    [showNotification],
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'error',
        title: title || 'НЕУДАЧА',
        message,
        duration: 7000,
      });
    },
    [showNotification],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'warning',
        title: title || 'Внимание',
        message,
        duration: 5000,
      });
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showNotification({
        type: 'info',
        title: title || 'Информация',
        message,
        duration: 4000,
      });
    },
    [showNotification],
  );

  const forceShowNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      dispatch(addNotification(notification));
    },
    [dispatch],
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
