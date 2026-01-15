import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { normalizeMessage } from 'shared/model/utils/normalizeMessage';

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  origin?: string;
  message: string;
  duration?: number;
};

type NotificationLogEntry = {
  action: string;
  origin: string;
  message: string;
  id?: string;
  existing?: unknown[];
  time: number;
};

declare global {
  interface Window {
    __NOTIFICATION_LOG__?: NotificationLogEntry[];
  }
}

type NotificationsState = {
  notifications: Notification[];
};

const initialState: NotificationsState = {
  notifications: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      const payload = action.payload;

      const newMessage = normalizeMessage(String(payload.message || ''));

      const duplicate = state.notifications.some(n => {
        const existing = normalizeMessage(String(n.message || ''));
        return (
          existing === newMessage ||
          existing.includes(newMessage) ||
          newMessage.includes(existing)
        );
      });

      try {
        window.__NOTIFICATION_LOG__ = window.__NOTIFICATION_LOG__ || [];
      } catch {}

      if (duplicate) {
        try {
          window.__NOTIFICATION_LOG__?.push({
            action: 'duplicate_prevented',
            origin: payload.origin || 'unknown',
            message: String(payload.message || ''),
            existing: state.notifications.map(n => n.message),
            time: Date.now(),
          });
        } catch {}

        return;
      }

      const id = crypto.randomUUID();
      state.notifications.push({ id, ...payload });

      try {
        window.__NOTIFICATION_LOG__?.push({
          action: 'added',
          origin: payload.origin || 'unknown',
          message: String(payload.message || ''),
          id,
          time: Date.now(),
        });
      } catch {}
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: state => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
