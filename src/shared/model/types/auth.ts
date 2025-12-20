import type { BaseResponse } from './api';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export type AuthResponse = BaseResponse<AuthTokens>;

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

export type ChangeProfilePictureData = {
  file: {
    filename: string;
    header: Record<string, string[]>;
    size: number;
  };
  userId: string;
};

export type ChangeProfilePictureResponse = BaseResponse<{
  newImgUrl: string;
}>;
