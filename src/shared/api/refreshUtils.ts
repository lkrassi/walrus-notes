import type { AuthTokens, RequestFunction } from 'shared/model';

import { refreshTokens } from 'shared/api/refresh';

let isRefreshing = false;
let refreshPromise: Promise<AuthTokens> | null = null;

export const callWithRefresh = async <T>(
  requestFn: RequestFunction<T>,
  currentTokens: AuthTokens
): Promise<T> => {
  try {
    return await requestFn(currentTokens);
  } catch (error: any) {
    if (
      error?.message?.includes('401') ||
      error?.message?.includes('unauthorized') ||
      error?.status === 401
    ) {
      try {
        if (isRefreshing && refreshPromise) {
          const newTokens = await refreshPromise;
          return await requestFn(newTokens);
        }

        isRefreshing = true;
        refreshPromise = (async () => {
          const refreshResponse = await refreshTokens({
            accessToken: currentTokens.accessToken,
            refreshToken: currentTokens.refreshToken,
          });

          const newTokens: AuthTokens = {
            accessToken: refreshResponse.data.accessToken,
            refreshToken: refreshResponse.data.refreshToken,
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);
          }

          return newTokens;
        })();

        const newTokens = await refreshPromise;

        isRefreshing = false;
        refreshPromise = null;

        return await requestFn(newTokens);
      } catch (refreshError) {
        isRefreshing = false;
        refreshPromise = null;
        throw new Error('Session expired. Please login again.');
      }
    }

    throw error;
  }
};
