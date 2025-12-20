import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  origin?: string;
  message: string;
  duration?: number;
};

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

      const normalize = (s: string) =>
        s
          .replace(/\s+/g, ' ')
          .replace(/request error[:\s-]*/i, '')
          .trim()
          .toLowerCase();

      const newMessage = normalize(String(payload.message || ''));

      const duplicate = state.notifications.some(n => {
        const existing = normalize(String(n.message || ''));
        return (
          existing === newMessage ||
          existing.includes(newMessage) ||
          newMessage.includes(existing)
        );
      });

      try {
        (window as any).__NOTIFICATION_LOG__ =
          (window as any).__NOTIFICATION_LOG__ || [];
      } catch {}

      if (duplicate) {
        try {
          (window as any).__NOTIFICATION_LOG__.push({
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
        (window as any).__NOTIFICATION_LOG__.push({
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
