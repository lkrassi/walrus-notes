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

interface LayoutBackupLayout {
  color?: string;
  id: string;
  isMain: boolean;
  ownerId: string;
  title: string;
}

interface LayoutBackupNotePosition {
  xPos: number;
  yPos: number;
}

interface LayoutBackupNote {
  draft: string;
  haveAccess: string[];
  id: string;
  layoutId: string;
  linkedWithIn: string[];
  linkedWithOut: string[];
  ownerId: string;
  payload: string;
  position: LayoutBackupNotePosition;
  title: string;
}

export interface LayoutBackupData {
  createdAt: string;
  layouts: LayoutBackupLayout[];
  notes: Record<string, LayoutBackupNote[]>;
  userId: string;
}

interface ExportLayoutRequest {
  userId: string;
}

interface ExportLayoutResponse {
  data: LayoutBackupData;
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

interface ImportLayoutRequest {
  info: LayoutBackupData;
}

interface ImportLayoutResponse {
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
    updateLayout: builder.mutation<
      CreateLayoutResponse,
      { layoutId: string; title?: string; color?: string }
    >({
      query: body => ({
        url: '/layout/update',
        method: 'POST',
        body: {
          layoutId: body.layoutId,
          title: body.title,
          color: body.color,
        },
      }),
      async onQueryStarted(
        { layoutId, title, color },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          layoutApi.util.updateQueryData('getMyLayouts', undefined, draft => {
            const idx = draft.data.findIndex(d => d.id === layoutId);
            if (idx !== -1) {
              if (typeof title === 'string') draft.data[idx].title = title;
              if (typeof color === 'string') draft.data[idx].color = color;
              draft.data[idx].updatedAt = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    exportLayout: builder.mutation<ExportLayoutResponse, ExportLayoutRequest>({
      query: body => ({
        url: '/layout/export',
        method: 'GET',
        params: { userId: body.userId },
      }),
    }),
    importLayout: builder.mutation<ImportLayoutResponse, ImportLayoutRequest>({
      query: body => ({
        url: '/layout/import',
        method: 'POST',
        body: { info: body.info },
      }),
      invalidatesTags: ['Layouts', 'Notes'],
    }),
  }),
});

export const {
  useGetMyLayoutsQuery,
  useCreateLayoutMutation,
  useDeleteLayoutMutation,
  useUpdateLayoutMutation,
  useExportLayoutMutation,
  useImportLayoutMutation,
} = layoutApi;
