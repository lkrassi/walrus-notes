import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  startLoading,
  startLoadingByKey,
  stopLoading,
  stopLoadingByKey,
} from 'app/store/slices/loaderSlice';

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
  const loadingKey = (() => {
    if (typeof extraOptions === 'object' && extraOptions !== null) {
      const opts = extraOptions as Record<string, unknown>;
      const v = opts['loadingKey'];
      if (v === null || typeof v === 'string') return v;
    }
    return undefined;
  })();

  if (loadingKey !== null) {
    if (loadingKey) {
      api.dispatch(startLoadingByKey(loadingKey));
    } else {
      api.dispatch(startLoading());
    }
  }

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

  if (loadingKey !== null) {
    if (loadingKey) {
      api.dispatch(stopLoadingByKey(loadingKey));
    } else {
      api.dispatch(stopLoading());
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
