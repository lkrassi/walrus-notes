export type MetaResponse = {
  code: string;
  error: string;
  message: string;
  requestId: string;
};

export type PaginationResponse = {
  page: number;
  pages: number;
  perPage: number;
};

export type BaseResponse<T = unknown> = {
  data: T;
  meta: MetaResponse;
  pagination: PaginationResponse;
};

export type ErrorResponse = BaseResponse<string>;
