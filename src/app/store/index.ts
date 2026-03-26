import {
  draftsReducer,
  notificationsReducer,
  permissionsReducer,
  saveTabsToStorage,
  tabsReducer,
  userReducer,
} from '@/entities';
import { apiSlice } from '@/shared/api';
import {
  configureStore,
  type Middleware,
  type UnknownAction,
} from '@reduxjs/toolkit';

const tabsPersistenceMiddleware: Middleware = storeAPI => next => action => {
  const result = next(action);
  const typedAction = action as UnknownAction;

  if (typedAction.type?.startsWith('tabs/')) {
    const state = storeAPI.getState() as {
      tabs: Parameters<typeof saveTabsToStorage>[0];
    };
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
