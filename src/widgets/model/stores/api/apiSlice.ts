import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { startLoading, stopLoading, startLoadingByKey, stopLoadingByKey } from '../slices/loaderSlice';

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
  const loadingKey = (extraOptions as any)?.loadingKey;

  if (loadingKey === null) {
  } else if (loadingKey) {
    api.dispatch(startLoadingByKey(loadingKey));
  } else {
    api.dispatch(startLoading());
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

        if (refreshResult.data) {
          const data = (refreshResult.data as any).data;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  if (loadingKey === null) {
  } else if (loadingKey) {
    api.dispatch(stopLoadingByKey(loadingKey));
  } else {
    api.dispatch(stopLoading());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Layouts', 'Notes', 'Profile'],
  endpoints: () => ({}),
});
