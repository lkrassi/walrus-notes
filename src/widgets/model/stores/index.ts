import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from 'widgets/model/stores/slices/loaderSlice';
import notificationsReducer from 'widgets/model/stores/slices/notificationsSlice';
import userReducer from 'widgets/model/stores/slices/userSlice';
import { apiSlice } from 'widgets/model/stores/api';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    notifications: notificationsReducer,
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoaderState = RootState['loader'];
export type NotificationsState = RootState['notifications'];
export type { UserProfileState } from 'widgets/model/stores/slices/userSlice';
