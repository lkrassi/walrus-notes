import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from 'app/store/api/apiSlice';
import { draftsReducer } from 'app/store/slices/draftsSlice';
import { notificationsReducer } from 'app/store/slices/notificationsSlice';
import { permissionsReducer } from 'app/store/slices/permissionsSlice';
import { saveTabsToStorage, tabsReducer } from 'app/store/slices/tabsSlice';
import { userReducer } from 'app/store/slices/userSlice';

const tabsPersistenceMiddleware =
  (storeAPI: any) => (next: any) => (action: any) => {
    const result = next(action);

    if (action.type?.startsWith('tabs/')) {
      const state = storeAPI.getState();
      saveTabsToStorage(state.tabs);
    }

    return result;
  };

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    permissions: permissionsReducer,
    user: userReducer,
    tabs: tabsReducer,
    drafts: draftsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(tabsPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type NotificationsState = RootState['notifications'];
export type UserProfileState = RootState['user'];

export * from 'app/store/api';
export * from 'app/store/slices';
