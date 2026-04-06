import { draftsReducer } from '@/entities/draft';
import { layoutApi } from '@/entities/layout';
import { notesApi } from '@/entities/note';
import { addNotification, notificationsReducer } from '@/entities/notification';
import { permissionsReducer } from '@/entities/permission';
import {
  closeLayoutTabs,
  closeTabsByItemId,
  saveTabsToStorage,
  tabsReducer,
} from '@/entities/tab';
import { userReducer } from '@/entities/user';
import { apiSlice } from '@/shared/api';
import { i18n } from '@/shared/config/i18n';
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

type RejectedApiAction = UnknownAction & {
  payload?: {
    status?: number | string;
    data?: {
      meta?: {
        code?: string;
        message?: string;
        error?: string;
      };
    };
  };
  meta?: {
    arg?: {
      endpointName?: string;
      originalArgs?: unknown;
    };
  };
};

const NOTE_ENDPOINTS = new Set([
  'updateNote',
  'deleteNote',
  'updateNotePosition',
  'createNoteLink',
  'deleteNoteLink',
  'dragNote',
]);

const LAYOUT_ENDPOINTS = new Set([
  'getMyLayouts',
  'updateLayout',
  'deleteLayout',
  'getNotes',
  'getPosedNotes',
  'getUnposedNotes',
  'createNote',
]);

let lastLayoutRecordNotFoundAt = 0;
const NOTE_NOTIFICATION_SUPPRESS_AFTER_LAYOUT_MS = 2500;

const getStringArg = (args: unknown, keys: string[]): string | undefined => {
  if (!args || typeof args !== 'object') return undefined;

  const source = args as Record<string, unknown>;

  for (const key of keys) {
    if (typeof source[key] === 'string' && source[key].trim()) {
      return source[key] as string;
    }
  }

  return undefined;
};

const isRecordNotFound422 = (action: RejectedApiAction) => {
  if (!action.type?.startsWith(`${apiSlice.reducerPath}/`)) return false;
  if (!action.type?.endsWith('/rejected')) return false;

  const status = action.payload?.status;
  const statusCode = typeof status === 'string' ? Number(status) : status;
  const code = action.payload?.data?.meta?.code;

  return statusCode === 422 && code === 'record_not_found';
};

const recordNotFoundMiddleware: Middleware = storeAPI => next => action => {
  const result = next(action);
  const rejectedAction = action as RejectedApiAction;

  if (!isRecordNotFound422(rejectedAction)) {
    return result;
  }

  const endpointName = rejectedAction.meta?.arg?.endpointName || '';
  const originalArgs = rejectedAction.meta?.arg?.originalArgs;
  const errorText =
    `${rejectedAction.payload?.data?.meta?.error || ''} ${rejectedAction.payload?.data?.meta?.message || ''}`.toLowerCase();

  const noteId = getStringArg(originalArgs, ['noteId', 'firstNoteId']);
  const layoutId = getStringArg(originalArgs, ['layoutId', 'toLayoutId']);

  const looksLikeLayoutError =
    errorText.includes('layoutrepo') ||
    errorText.includes('layout') ||
    (!!layoutId && LAYOUT_ENDPOINTS.has(endpointName));

  const looksLikeNoteError =
    errorText.includes('noterepo') ||
    errorText.includes('note') ||
    (!!noteId && NOTE_ENDPOINTS.has(endpointName));

  if (looksLikeLayoutError && layoutId) {
    lastLayoutRecordNotFoundAt = Date.now();

    storeAPI.dispatch(closeLayoutTabs(layoutId));
    storeAPI.dispatch(layoutApi.util.invalidateTags(['Layouts', 'Notes']));
    storeAPI.dispatch(
      addNotification({
        type: 'warning',
        message: i18n.t('layout:recordNotFoundWithNotes'),
        duration: 6000,
        origin: 'api-record-not-found',
      })
    );

    return result;
  }

  if (looksLikeNoteError && noteId) {
    storeAPI.dispatch(closeTabsByItemId({ itemId: noteId, itemType: 'note' }));

    const state = storeAPI.getState() as {
      api: {
        queries: Record<
          string,
          {
            endpointName?: string;
            originalArgs?: unknown;
          }
        >;
      };
    };

    const queries = Object.values(state.api?.queries || {});

    for (const query of queries) {
      const queryEndpoint = query.endpointName;
      const queryArgs = query.originalArgs;

      if (!queryEndpoint || queryArgs === undefined) continue;

      storeAPI.dispatch(notesApi.util.invalidateTags(['Notes']));

      if (
        Date.now() - lastLayoutRecordNotFoundAt >
        NOTE_NOTIFICATION_SUPPRESS_AFTER_LAYOUT_MS
      ) {
        storeAPI.dispatch(
          addNotification({
            type: 'warning',
            message: i18n.t('notes:recordNotFoundDeleted'),
            duration: 6000,
            origin: 'api-record-not-found',
          })
        );
      }
    }
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
      .concat(tabsPersistenceMiddleware)
      .concat(recordNotFoundMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
