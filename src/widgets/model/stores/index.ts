import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from 'widgets/model/stores/slices/loaderSlice';
import notificationsReducer from 'widgets/model/stores/slices/notificationsSlice';
import userReducer from 'widgets/model/stores/slices/userSlice';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    notifications: notificationsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoaderState = RootState['loader'];
export type NotificationsState = RootState['notifications'];
export type { UserProfileState } from 'widgets/model/stores/slices/userSlice';
