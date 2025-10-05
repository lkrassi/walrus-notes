import type { AuthTokens, RequestFunction } from 'shared/model';

import { callWithRefresh } from 'shared/api/refreshUtils';

export const authRequest = async <T>(
  requestFn: RequestFunction<T>
): Promise<T> => {
  const getCurrentTokens = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  };

  const tokens = getCurrentTokens();
  if (!tokens) {
    throw new Error('No authentication tokens found');
  }

  return callWithRefresh(requestFn, tokens);
};
