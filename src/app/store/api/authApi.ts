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

interface SendConfirmCodeRequest {
  email: string;
  password: string;
}

interface SendConfirmCodeResponse {
  data: {
    nextCodeDelay: number;
  };
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface ConfirmCodeRequest {
  email: string;
  code: string;
  newPassword?: string;
}

interface ConfirmCodeResponse {
  data: string;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  data: {
    nextCodeDelay: number;
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
    sendConfirmCode: builder.mutation<
      SendConfirmCodeResponse,
      SendConfirmCodeRequest
    >({
      query: data => ({
        url: '/auth/code',
        method: 'POST',
        body: data,
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }),
    }),
    confirmCode: builder.mutation<ConfirmCodeResponse, ConfirmCodeRequest>({
      query: data => ({
        url: '/auth/confirm',
        method: 'POST',
        body: data,
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }),
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: data => ({
        url: '/auth/forgot',
        method: 'POST',
        body: data,
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }),
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
        },
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendConfirmCodeMutation,
  useConfirmCodeMutation,
  useForgotPasswordMutation,
  useRefreshMutation,
} = authApi;
