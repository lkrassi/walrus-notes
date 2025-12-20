import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from 'app/store/api/apiSlice';
import notificationsReducer from 'app/store/slices/notificationsSlice';
import tabsReducer from 'app/store/slices/tabsSlice';
import userReducer from 'app/store/slices/userSlice';
import draftsReducer from 'app/store/slices/draftsSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    user: userReducer,
    tabs: tabsReducer,
    drafts: draftsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type NotificationsState = RootState['notifications'];
export type UserProfileState = RootState['user'];

export * from 'app/store/api';
export * from 'app/store/slices';
