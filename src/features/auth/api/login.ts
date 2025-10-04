import type { AuthResponse, ErrorResponse, LoginData } from 'shared/model/types';

export const login = async (data: LoginData): Promise<AuthResponse> => {
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
};
