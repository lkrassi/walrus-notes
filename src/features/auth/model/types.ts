export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  data: AuthTokens;
  meta: {
    code: string;
    error: string;
    message: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type RegisterResponse = {
  data: {
    userId: string;
  };
  meta: {
    code: string;
    error: string;
    message: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type ErrorResponse = {
  data: string;
  meta: {
    code: string;
    error: string;
    message: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  username: string;
};

export type RefreshData = {
  accessToken: string;
  refreshToken: string;
};

export type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
};

export type RequestFunction<T> = (tokens: AuthTokens) => Promise<T>;
