export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
}

export type ErrorResponse ={
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
}

export type BaseResponse<T = unknown> = {
  data: T;
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
}

export type CreateLayoutRequest = {
  title: string;
}

export type CreateLayoutResponse = {
  id: string;
}
