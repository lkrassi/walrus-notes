import { authRequest } from 'shared/api';
import type {
  AuthTokens,
  UpdateNoteApiResponse,
  UpdateNoteRequest,
} from 'shared/model';

export const updateNote = async (
  data: UpdateNoteRequest
): Promise<UpdateNoteApiResponse> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<UpdateNoteApiResponse> => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/notes/update`,
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

  return authRequest(requestFn);
};
