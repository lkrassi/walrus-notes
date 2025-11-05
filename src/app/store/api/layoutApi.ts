import type { Layout } from 'shared/model/types/layouts';
import { apiSlice } from './apiSlice';

interface GetMyLayoutsResponse {
  data: Layout[];
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
  pagination: {
    page: number;
    perPage: number;
    pages: number;
  };
}

interface CreateLayoutRequest {
  title: string;
}

interface CreateLayoutResponse {
  data: Layout;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface DeleteLayoutRequest {
  layoutId: string;
}

interface DeleteLayoutResponse {
  data: string;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
}

export const layoutApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMyLayouts: builder.query<GetMyLayoutsResponse, void>({
      query: () => '/layout/my',
      providesTags: ['Layouts'],
    }),
    createLayout: builder.mutation<CreateLayoutResponse, CreateLayoutRequest>({
      query: body => ({
        url: '/layout/create',
        method: 'POST',
        body: { title: body.title },
      }),
      invalidatesTags: ['Layouts'],
    }),
    deleteLayout: builder.mutation<DeleteLayoutResponse, DeleteLayoutRequest>({
      query: body => ({
        url: '/layout/delete',
        method: 'POST',
        body: { layoutId: body.layoutId },
      }),
      invalidatesTags: ['Layouts'],
    }),
  }),
});

export const {
  useGetMyLayoutsQuery,
  useCreateLayoutMutation,
  useDeleteLayoutMutation,
} = layoutApi;
