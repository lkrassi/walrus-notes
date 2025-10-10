import type { AppDispatch } from 'widgets/model/stores';
import type {
  AuthTokens,
  BaseResponse,
  GetMyLayoutsResponse,
} from 'shared/model';

import { authRequest } from 'shared/api';

export const getMyLayouts = async (dispatch: AppDispatch): Promise<BaseResponse<GetMyLayoutsResponse>> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<BaseResponse<GetMyLayoutsResponse>> => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/layout/my`,
      {
        method: 'GET',
        headers: {
          'X-Request-Id': crypto.randomUUID(),
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.meta?.message || `HTTP error! status: ${response.status}`
      );
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  };

  return authRequest(requestFn, dispatch);
};
