import type { AppDispatch } from 'widgets/model/stores';
import type { AuthTokens } from 'shared/model/types/auth';
import type { ChangeProfilePictureResponse } from 'shared/model/types/profile';
import { authRequest } from 'shared/api/authRequest';

export const changeProfilePicture = async (
  file: File,
  dispatch: AppDispatch
): Promise<ChangeProfilePictureResponse> => {
  const requestFn = async (
    tokens: AuthTokens
  ): Promise<ChangeProfilePictureResponse> => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/user/picture`,
      {
        method: 'POST',
        headers: {
          'X-Request-Id': crypto.randomUUID(),
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: formData,
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
