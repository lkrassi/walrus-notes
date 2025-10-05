import { authRequest } from 'shared/api';
import type {
  AuthTokens,
  GetNotesApiResponse,
  GetNotesRequest,
} from 'shared/model';

export const getNotes = async (
  data: GetNotesRequest
): Promise<GetNotesApiResponse> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<GetNotesApiResponse> => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/notes/layout`,
      {
        method: 'GET',
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
