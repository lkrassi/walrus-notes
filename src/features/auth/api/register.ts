import type {
  ErrorResponse,
  RegisterData,
  RegisterResponse,
} from '../model/types';

export const register = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await fetch(
    `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/auth/register`,
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
    throw new Error(errorData.meta.message || 'Registration failed');
  }

  return response.json();
};
