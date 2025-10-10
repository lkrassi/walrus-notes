import type { AppDispatch } from 'widgets/model/stores';
import type { AuthResponse, ErrorResponse, LoginData } from 'shared/model';
import { startLoading, stopLoading } from 'widgets/model/stores/slices/loaderSlice';

export const login = async (data: LoginData, dispatch: AppDispatch): Promise<AuthResponse> => {
  dispatch(startLoading());
  try {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.meta.message || 'Login failed');
    }

    return response.json();
  } finally {
    dispatch(stopLoading());
  }
};
