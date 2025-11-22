import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { addNotification } from 'app/store/slices/notificationsSlice';
import i18n from '../../../i18n';

const baseQuery = fetchBaseQuery({
  baseUrl: `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1`,
  prepareHeaders: headers => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('X-Request-Id', crypto.randomUUID());
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      try {
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { accessToken, refreshToken },
          },
          api,
          extraOptions
        );

        if (
          refreshResult.data &&
          typeof refreshResult.data === 'object' &&
          'data' in (refreshResult.data as Record<string, unknown>)
        ) {
          const inner = (refreshResult.data as Record<string, unknown>)['data'];
          if (inner && typeof inner === 'object') {
            const innerObj = inner as Record<string, unknown>;
            const accessTok = innerObj['accessToken'];
            const refreshTok = innerObj['refreshToken'];
            if (typeof accessTok === 'string')
              localStorage.setItem('accessToken', accessTok);
            if (typeof refreshTok === 'string')
              localStorage.setItem('refreshToken', refreshTok);
            result = await baseQuery(args, api, extraOptions);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  if (result.error) {
    try {
      const err = result.error as unknown;
      let maybeMsg = '';

      const getStringAt = (
        root: unknown,
        path: string[]
      ): string | undefined => {
        let cur: unknown = root;
        for (const p of path) {
          if (!cur || typeof cur !== 'object') return undefined;
          cur = (cur as Record<string, unknown>)[p];
        }
        return typeof cur === 'string' ? cur : undefined;
      };

      if (err && typeof err === 'object') {
        maybeMsg =
          getStringAt(err, ['data', 'meta', 'message']) ||
          getStringAt(err, ['data', 'message']) ||
          getStringAt(err, ['error']) ||
          '';
      } else if (typeof err === 'string') {
        maybeMsg = err;
      } else {
        try {
          maybeMsg = JSON.stringify(err);
        } catch {
          maybeMsg = '';
        }
      }

      const title = i18n.t('errors.requestTitle') || 'Request error';
      const fallback = i18n.t('errors.requestFallback') || 'Request failed';
      api.dispatch(
        addNotification({
          type: 'error',
          title,
          message: String(maybeMsg || fallback),
          duration: 5000,
        })
      );
    } catch {
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Layouts', 'Notes', 'Profile'],
  endpoints: () => ({}),
});
