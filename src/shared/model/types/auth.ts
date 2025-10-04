import type { BaseResponse } from './api';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = BaseResponse<AuthTokens>;

export type RegisterResponse = BaseResponse<{
  userId: string;
}>;

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  username: string;
};

export type RefreshData = AuthTokens;

export type RequestFunction<T> = (tokens: AuthTokens) => Promise<T>;
