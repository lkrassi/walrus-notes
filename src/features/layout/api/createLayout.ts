import type { AppDispatch } from 'widgets/model/stores';
import type {
  AuthTokens,
  BaseResponse,
  CreateLayoutRequest,
  CreateLayoutResponse,
} from 'shared/model';

import { authRequest } from 'shared/api';

export const createLayout = async (
  data: CreateLayoutRequest,
  dispatch: AppDispatch
): Promise<BaseResponse<CreateLayoutResponse>> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<BaseResponse<CreateLayoutResponse>> => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/layout/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(data),
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
