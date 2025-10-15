export type CreateLayoutRequest = {
  title: string;
};

export type CreateLayoutResponse = {
  id: string;
};

export type Layout = {
  id: string;
  title: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: Note[];
};

export type Note = {
  id: string;
  layoutId: string;
  title: string;
  payload: string;
  createdAt: string;
  updatedAt: string;
};

export type GetMyLayoutsResponse = {
  data: Layout[];
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
