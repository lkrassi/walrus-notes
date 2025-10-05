import type { AuthTokens, RequestFunction } from 'shared/model';

import { refreshTokens } from 'shared/api/refresh';

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

        return await requestFn(newTokens);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
        }
        throw new Error('Session expired. Please login again.');
      }
    }

    throw error;
  }
};
