import type { AppDispatch } from 'widgets/model/stores';
import { authRequest } from 'shared/api';
import type {
  AuthTokens,
  GetNotesApiResponse,
  GetNotesRequest,
} from 'shared/model';

export const getNotes = async (
  data: GetNotesRequest,
  dispatch: AppDispatch
): Promise<GetNotesApiResponse> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<GetNotesApiResponse> => {
    const url = `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/notes/layout?layoutId=${encodeURIComponent(data.layoutId)}${data.page ? `&page=${data.page}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Request-Id': crypto.randomUUID(),
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

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
