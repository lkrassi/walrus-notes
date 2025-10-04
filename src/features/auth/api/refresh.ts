import type { AuthResponse, ErrorResponse, RefreshData } from 'shared/model/types';

export const refreshTokens = async (
  data: RefreshData
): Promise<AuthResponse> => {
  const response = await fetch(
    `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/auth/refresh`,
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
    throw new Error(errorData.meta.message || 'Token refresh failed');
  }

  return response.json();
};
