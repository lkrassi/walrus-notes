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
  color?: string;
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
        body: { title: body.title, color: body.color },
      }),
      invalidatesTags: ['Layouts'],
      onQueryStarted: async ({ title }, { dispatch, queryFulfilled }) => {
        const tempId = `temp-${Date.now()}`;
        const tempLayout: Layout = {
          id: tempId,
          title,
          ownerId: '',
          isMain: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Layout;

        const patchResult = dispatch(
          layoutApi.util.updateQueryData('getMyLayouts', undefined, draft => {
            draft.data.unshift(tempLayout);
          })
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            layoutApi.util.updateQueryData('getMyLayouts', undefined, draft => {
              const idx = draft.data.findIndex(l => l.id === tempId);
              if (idx !== -1) draft.data[idx] = data.data;
              else draft.data.unshift(data.data);
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteLayout: builder.mutation<DeleteLayoutResponse, DeleteLayoutRequest>({
      query: body => ({
        url: '/layout/delete',
        method: 'POST',
        body: { layoutId: body.layoutId },
      }),
      invalidatesTags: ['Layouts'],
      onQueryStarted: async ({ layoutId }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          layoutApi.util.updateQueryData('getMyLayouts', undefined, draft => {
            draft.data = draft.data.filter(l => l.id !== layoutId);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetMyLayoutsQuery,
  useCreateLayoutMutation,
  useDeleteLayoutMutation,
} = layoutApi;
