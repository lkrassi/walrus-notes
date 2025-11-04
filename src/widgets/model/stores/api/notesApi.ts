import type { Note } from 'shared/model/types/layouts';
import type { NotePosition } from 'shared/model/types/notes';
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

interface UpdateNotePositionRequest extends NotePosition {}

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

const createTempNote = (
  layoutId: string,
  title: string = 'Новая заметка'
): Note => ({
  id: `temp-${Date.now()}`,
  layoutId,
  title,
  payload: '',
  ownerId: '',
  haveAccess: [],
  linkedWith: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

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
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId, page: 1 },
            draft => {
              const tempNote = createTempNote(layoutId);
              draft.data.unshift(tempNote);
            }
          )
        );

        try {
          const { data: createdNote } = await queryFulfilled;

          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId, page: 1 },
              draft => {
                const tempIndex = draft.data.findIndex(note =>
                  note.id.startsWith('temp-')
                );
                if (tempIndex !== -1) {
                  draft.data[tempIndex] = createdNote.data;
                } else {
                  draft.data.unshift(createdNote.data);
                }
              }
            )
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

    getPosedNotes: builder.query<GetPosedNotesResponse, GetPosedNotesRequest>({
      query: ({ layoutId }) => `/notes/layout/graph/posed?layoutId=${layoutId}`,
      providesTags: (result, error, arg) => [
        { type: 'Notes', id: `posed-${arg.layoutId}` },
        ...(result?.data?.map(note => ({
          type: 'Notes' as const,
          id: note.id,
        })) || []),
        'Notes',
      ],
    }),

    getUnposedNotes: builder.query<
      GetUnposedNotesResponse,
      GetUnposedNotesRequest
    >({
      query: ({ layoutId }) =>
        `/notes/layout/graph/unposed?layoutId=${layoutId}`,
      providesTags: (result, error, arg) => [
        { type: 'Notes', id: `unposed-${arg.layoutId}` },
        ...(result?.data?.map(note => ({
          type: 'Notes' as const,
          id: note.id,
        })) || []),
        'Notes',
      ],
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
      invalidatesTags: [],
      extraOptions: {
        loadingKey: null,
      },
      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const state = getState() as any;

        let realNoteData: Note | undefined;

        try {
          const unposedCache = notesApi.endpoints.getUnposedNotes.select({
            layoutId: arg.layoutId,
          })(state);
          if (unposedCache.data?.data) {
            realNoteData = unposedCache.data.data.find(
              note => note.id === arg.noteId
            );
          }
        } catch (error) {
          console.warn(error);
        }

        if (!realNoteData) {
          try {
            const notesCache = notesApi.endpoints.getNotes.select({
              layoutId: arg.layoutId,
              page: 1,
            })(state);
            if (notesCache.data?.data) {
              realNoteData = notesCache.data.data.find(
                note => note.id === arg.noteId
              );
            }
          } catch (error) {
            console.warn(error);
          }
        }

        const patchResult = dispatch(
          notesApi.util.updateQueryData(
            'getPosedNotes',
            { layoutId: arg.layoutId },
            draft => {
              const noteIndex = draft.data.findIndex(
                note => note.id === arg.noteId
              );

              if (noteIndex !== -1) {
                draft.data[noteIndex].position = {
                  xPos: arg.xPos,
                  yPos: arg.yPos,
                };
              } else {
                const newNote: Note = realNoteData
                  ? {
                      ...realNoteData,
                      position: {
                        xPos: arg.xPos,
                        yPos: arg.yPos,
                      },
                    }
                  : createTempNote(arg.layoutId);
                draft.data.push(newNote);
              }
            }
          )
        );

        const unposedPatchResult = dispatch(
          notesApi.util.updateQueryData(
            'getUnposedNotes',
            { layoutId: arg.layoutId },
            draft => {
              draft.data = draft.data.filter(note => note.id !== arg.noteId);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          unposedPatchResult.undo();
        }
      },
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
      invalidatesTags: [],
      extraOptions: {
        loadingKey: null,
      },

      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const patchResults = [];

        try {
          const posedNotesCache = notesApi.endpoints.getPosedNotes.select({
            layoutId: arg.layoutId,
          })(getState() as any);

          if (posedNotesCache.data?.data) {
            const patchResult = dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId: arg.layoutId },
                draft => {
                  const sourceNote = draft.data.find(
                    n => n.id === arg.firstNoteId
                  );
                  if (sourceNote) {
                    if (!sourceNote.linkedWith) {
                      sourceNote.linkedWith = [];
                    }
                    if (!sourceNote.linkedWith.includes(arg.secondNoteId)) {
                      sourceNote.linkedWith.push(arg.secondNoteId);
                    }
                  }
                }
              )
            );
            patchResults.push(patchResult);
          }
        } catch (error) {
          console.warn(error);
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach(patchResult => patchResult.undo());
        }
      },
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
      invalidatesTags: [],
      extraOptions: {
        loadingKey: null,
      },

      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const patchResults = [];

        try {
          const posedNotesCache = notesApi.endpoints.getPosedNotes.select({
            layoutId: arg.layoutId,
          })(getState() as any);

          if (posedNotesCache.data?.data) {
            const patchResult = dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId: arg.layoutId },
                draft => {
                  const sourceNote = draft.data.find(
                    n => n.id === arg.firstNoteId
                  );
                  if (sourceNote && sourceNote.linkedWith) {
                    sourceNote.linkedWith = sourceNote.linkedWith.filter(
                      id => id !== arg.secondNoteId
                    );
                  }
                }
              )
            );
            patchResults.push(patchResult);
          }
        } catch (error) {
          console.warn(error);
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach(patchResult => patchResult.undo());
        }
      },
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
} = notesApi;
