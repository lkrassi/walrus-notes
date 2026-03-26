import { layoutApi } from '@/entities/layout';
import type { Note } from '@/entities/note';
import { updateTabNote } from '@/entities/tab';
import { apiSlice } from '@/shared/api';

type LocalRootState = {
  api: ReturnType<typeof apiSlice.reducer>;
  [k: string]: unknown;
};

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

interface GetPosedNotesRequest {
  layoutId: string;
}

interface GetPosedNotesResponse {
  data: Note[];
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

interface GetUnposedNotesRequest {
  layoutId: string;
}

interface GetUnposedNotesResponse {
  data: Note[];
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

interface UpdateNotePositionRequest {
  layoutId: string;
  noteId: string;
  xPos: number;
  yPos: number;
}

interface UpdateNotePositionResponse {
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

interface CreateNoteLinkRequest {
  firstNoteId: string;
  layoutId: string;
  secondNoteId: string;
}

interface CreateNoteLinkResponse {
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

interface DeleteNoteLinkRequest {
  firstNoteId: string;
  layoutId: string;
  secondNoteId: string;
}

interface DeleteNoteLinkResponse {
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

interface SearchNotesRequest {
  search: string;
}

interface SearchNotesResponse {
  data: Note[];
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

const createTempNote = (title: string = 'Новая заметка'): Note => ({
  id: `temp-${Date.now()}`,
  title,
  payload: '',
  isMain: false,
  ownerId: '',
  haveAccess: [],
  linkedWithIn: [],
  linkedWithOut: [],
});

export const notesApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getNotes: builder.query<GetNotesResponse, GetNotesRequest>({
      query: ({ layoutId, page = 1 }) =>
        `/notes/layout?layoutId=${layoutId}&page=${page}`,
      providesTags: (result, _e, arg) => [
        { type: 'Notes', id: arg.layoutId },
        ...(result?.data?.map(note => ({
          type: 'Notes' as const,
          id: note.id,
        })) || []),
        'Notes',
      ],
    }),

    dragNote: builder.mutation<void, { noteId: string; toLayoutId: string }>({
      query: ({ noteId, toLayoutId }) => ({
        url: '/notes/drag',
        method: 'POST',
        body: { noteId, toLayoutId },
      }),
      async onQueryStarted(
        { noteId, toLayoutId },
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as unknown as LocalRootState;

        const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(state);
        const layouts = layoutsCache.data?.data || [];

        let fromLayoutId: string | undefined;
        let movedNote: Note | undefined;

        for (const l of layouts) {
          try {
            const cache = notesApi.endpoints.getNotes.select({
              layoutId: l.id,
              page: 1,
            })(state);

            const found = cache.data?.data?.find(n => n.id === noteId);

            if (found) {
              fromLayoutId = l.id;
              movedNote = found;
              break;
            }
          } catch {}
        }

        if (!fromLayoutId || !movedNote) return;

        const removePatch = dispatch(
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId: fromLayoutId, page: 1 },
            draft => {
              if (!draft) return;
              draft.data = draft.data.filter(n => n.id !== noteId);
            }
          )
        );

        const addPatch = dispatch(
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId: toLayoutId, page: 1 },
            draft => {
              if (!draft) return;
              draft.data.unshift(movedNote as Note);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          removePatch.undo();
          addPatch.undo();
        }
      },
    }),

    createNote: builder.mutation<CreateNoteResponse, CreateNoteRequest>({
      query: body => ({
        url: '/notes/create',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        const temp = createTempNote(arg.title);

        const patch = dispatch(
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId: arg.layoutId, page: 1 },
            draft => {
              draft.data.unshift(temp);
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: arg.layoutId, page: 1 },
              draft => {
                const i = draft.data.findIndex(n => n.id === temp.id);
                if (i !== -1) {
                  const responseTitle = data.data.title?.trim();
                  draft.data[i] = {
                    ...data.data,
                    // Keep optimistic title if API response is temporarily empty.
                    title: responseTitle?.length ? responseTitle : temp.title,
                  };
                }
              }
            )
          );
        } catch {
          patch.undo();
        }
      },
    }),

    updateNote: builder.mutation<UpdateNoteResponse, UpdateNoteRequest>({
      query: ({ noteId, ...body }) => ({
        url: '/notes/update',
        method: 'POST',
        body: { noteId, ...body },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as LocalRootState;
        const layouts =
          layoutApi.endpoints.getMyLayouts.select()(state).data?.data || [];

        const patches: any[] = [];

        for (const l of layouts) {
          patches.push(
            dispatch(
              notesApi.util.updateQueryData(
                'getNotes',
                { layoutId: l.id, page: 1 },
                draft => {
                  const n = draft?.data.find(n => n.id === arg.noteId);
                  if (n) {
                    if (arg.title !== undefined) n.title = arg.title;
                    if (arg.payload !== undefined) n.payload = arg.payload;
                  }
                }
              )
            )
          );
        }

        try {
          const { data } = await queryFulfilled;
          dispatch(
            updateTabNote({
              noteId: arg.noteId,
              updates: data.data,
            })
          );
        } catch {
          patches.forEach(p => p.undo());
        }
      },
    }),

    deleteNote: builder.mutation<DeleteNoteResponse, DeleteNoteRequest>({
      query: ({ noteId }) => ({
        url: '/notes/delete',
        method: 'POST',
        body: { noteId },
      }),
      invalidatesTags: ['Notes'],
    }),

    getPosedNotes: builder.query<GetPosedNotesResponse, GetPosedNotesRequest>({
      query: ({ layoutId }) => `/notes/layout/graph/posed?layoutId=${layoutId}`,
    }),

    getUnposedNotes: builder.query<
      GetUnposedNotesResponse,
      GetUnposedNotesRequest
    >({
      query: ({ layoutId }) =>
        `/notes/layout/graph/unposed?layoutId=${layoutId}`,
    }),

    updateNotePosition: builder.mutation<
      UpdateNotePositionResponse,
      UpdateNotePositionRequest
    >({
      query: body => ({
        url: '/notes/layout/graph/note',
        method: 'POST',
        body,
      }),
    }),

    createNoteLink: builder.mutation<
      CreateNoteLinkResponse,
      CreateNoteLinkRequest
    >({
      query: body => ({
        url: '/notes/layout/links/create',
        method: 'POST',
        body,
      }),
    }),

    deleteNoteLink: builder.mutation<
      DeleteNoteLinkResponse,
      DeleteNoteLinkRequest
    >({
      query: body => ({
        url: '/notes/layout/links/delete',
        method: 'POST',
        body,
      }),
    }),

    searchNotes: builder.query<SearchNotesResponse, SearchNotesRequest>({
      query: ({ search }) =>
        `/notes/search?search=${encodeURIComponent(search)}`,
    }),
  }),
});

export const {
  useGetNotesQuery,
  useLazyGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetPosedNotesQuery,
  useGetUnposedNotesQuery,
  useUpdateNotePositionMutation,
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
  useSearchNotesQuery,
  useLazySearchNotesQuery,
  useDragNoteMutation,
} = notesApi;
