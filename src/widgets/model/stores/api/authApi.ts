import { apiSlice } from './apiSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  };
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface RefreshResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}


export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        },
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation } =
  authApi;
