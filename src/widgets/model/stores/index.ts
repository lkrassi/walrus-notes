import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from 'widgets/model/stores/api';
import loaderReducer from 'widgets/model/stores/slices/loaderSlice';
import notificationsReducer from 'widgets/model/stores/slices/notificationsSlice';
import tabsReducer from 'widgets/model/stores/slices/tabsSlice';
import userReducer from 'widgets/model/stores/slices/userSlice';

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
