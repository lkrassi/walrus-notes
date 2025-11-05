import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from 'app/store/api/apiSlice';
import loaderReducer from 'app/store/slices/loaderSlice';
import notificationsReducer from 'app/store/slices/notificationsSlice';
import tabsReducer from 'app/store/slices/tabsSlice';
import userReducer from 'app/store/slices/userSlice';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    notifications: notificationsReducer,
    user: userReducer,
    tabs: tabsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoaderState = RootState['loader'];
export type NotificationsState = RootState['notifications'];
export type UserProfileState = RootState['user'];

export * from 'app/store/api';
export * from 'app/store/slices';
