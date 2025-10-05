import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from 'widgets/model/stores/slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type NotificationsState = RootState['notifications'];
