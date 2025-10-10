import type { AppDispatch } from 'widgets/model/stores';
import { authRequest } from 'shared/api';
import type {
  AuthTokens,
  DeleteNoteApiResponse,
  DeleteNoteRequest,
} from 'shared/model';

export const deleteNote = async (
  data: DeleteNoteRequest,
  dispatch: AppDispatch
): Promise<DeleteNoteApiResponse> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<DeleteNoteApiResponse> => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/notes/delete`,
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
