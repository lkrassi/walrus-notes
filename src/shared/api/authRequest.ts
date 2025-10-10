import type { AppDispatch } from 'widgets/model/stores';
import type { AuthTokens, RequestFunction } from 'shared/model';

import { callWithRefresh } from 'shared/api/refreshUtils';
import { startLoading, stopLoading } from 'widgets/model/stores/slices/loaderSlice';

export const authRequest = async <T>(
  requestFn: RequestFunction<T>,
  dispatch: AppDispatch
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

  dispatch(startLoading());
  try {
    const result = await callWithRefresh(requestFn, tokens);
    return result;
  } finally {
    dispatch(stopLoading());
  }
};
