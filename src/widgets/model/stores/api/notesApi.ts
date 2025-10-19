import type { Note } from 'shared/model/types/layouts';
import { apiSlice } from './apiSlice';

interface GetNotesRequest {
  layoutId: string;
  page?: number;
}

interface GetNotesResponse {
  data: Note[];
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

interface CreateNoteRequest {
  layoutId: string;
  title: string;
  payload: string;
}

interface CreateNoteResponse {
  data: Note;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface UpdateNoteRequest {
  noteId: string;
  title?: string;
  payload?: string;
}

interface UpdateNoteResponse {
  data: Note;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface DeleteNoteRequest {
  noteId: string;
}

interface DeleteNoteResponse {
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

export const notesApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getNotes: builder.query<GetNotesResponse, GetNotesRequest>({
      query: ({ layoutId, page = 1 }) =>
        `/notes/layout?layoutId=${layoutId}&page=${page}`,
      providesTags: (result, error, arg) => [
        { type: 'Notes', id: arg.layoutId },
        ...(result?.data?.map(note => ({
          type: 'Notes' as const,
          id: note.id,
        })) || []),
        'Notes',
      ],
      extraOptions: {
        loadingKey: null,
      },
    }),

    createNote: builder.mutation<CreateNoteResponse, CreateNoteRequest>({
      query: body => ({
        url: '/notes/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Notes', id: arg.layoutId },
        'Notes',
      ],
      onQueryStarted: async ({ layoutId }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          notesApi.util.updateQueryData('getNotes', { layoutId, page: 1 }, (draft) => {
            const tempNote: Note = {
              id: `temp-${Date.now()}`,
              layoutId,
              title: 'Новая заметка',
              payload: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempNote);
          })
        );

        try {
          const { data: createdNote } = await queryFulfilled;

          dispatch(
            notesApi.util.updateQueryData('getNotes', { layoutId, page: 1 }, (draft) => {
              const tempIndex = draft.data.findIndex(note => note.id.startsWith('temp-'));
              if (tempIndex !== -1) {
                draft.data[tempIndex] = createdNote.data;
              } else {
                draft.data.unshift(createdNote.data);
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateNote: builder.mutation<UpdateNoteResponse, UpdateNoteRequest>({
      query: ({ noteId, ...body }) => ({
        url: '/notes/update',
        method: 'POST',
        body: { noteId, ...body },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Notes', id: arg.noteId },
        'Notes',
      ],
    }),

    deleteNote: builder.mutation<DeleteNoteResponse, DeleteNoteRequest>({
      query: ({ noteId }) => ({
        url: '/notes/delete',
        method: 'POST',
        body: { noteId },
      }),
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useLazyGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;
