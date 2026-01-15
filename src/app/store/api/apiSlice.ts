import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setTokens, clearUserProfile } from 'app/store/slices/userSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    // Читаем токен из Redux store вместо localStorage
    const state = getState() as { user: { accessToken: string | null } };
    const token = state.user.accessToken;

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
    // Читаем токены из Redux store
    const state = api.getState() as {
      user: { accessToken: string | null; refreshToken: string | null };
    };
    const accessToken = state.user.accessToken;
    const refreshToken = state.user.refreshToken;

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

            if (
              typeof accessTok === 'string' &&
              typeof refreshTok === 'string'
            ) {
              // Используем Redux action для синхронизации токенов
              api.dispatch(
                setTokens({
                  accessToken: accessTok,
                  refreshToken: refreshTok,
                })
              );
              result = await baseQuery(args, api, extraOptions);
            } else {
              // Централизованная очистка через Redux
              api.dispatch(clearUserProfile());
            }
          } else {
            api.dispatch(clearUserProfile());
          }
        } else {
          api.dispatch(clearUserProfile());
        }
      } catch {
        api.dispatch(clearUserProfile());
      }
    } else {
      api.dispatch(clearUserProfile());
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
