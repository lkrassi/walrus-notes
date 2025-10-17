import { apiSlice } from './apiSlice';
import type { Layout } from 'shared/model/types/layouts';

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

export const layoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyLayouts: builder.query<GetMyLayoutsResponse, void>({
      query: () => '/layout/my',
      providesTags: ['Layouts'],
    }),
    createLayout: builder.mutation<CreateLayoutResponse, CreateLayoutRequest>({
      query: (body) => ({
        url: '/layout/create',
        method: 'POST',
        body: { title: body.title },
      }),
      invalidatesTags: ['Layouts'],
    }),
  }),
});

export const { useGetMyLayoutsQuery, useCreateLayoutMutation } = layoutApi;
