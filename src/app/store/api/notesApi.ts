import type { RootState } from 'app/store';
import type { Note, Layout } from 'shared/model/types/layouts';
import type { NotePosition } from 'shared/model/types/notes';
import { apiSlice } from './apiSlice';
import { layoutApi } from './layoutApi';
import { updateTabNote } from 'app/store/slices/tabsSlice';

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
  linkedWith: [],
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

    createNote: builder.mutation<CreateNoteResponse, CreateNoteRequest>({
      query: body => ({
        url: '/notes/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        const { layoutId } = arg;
        const patchResult = dispatch(
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId, page: 1 },
            draft => {
              const tempNote = createTempNote(arg.title ?? 'Новая заметка');
              draft.data.unshift(tempNote);
            }
          )
        );

        const unposedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getUnposedNotes',
            { layoutId },
            draft => {
              const tempNote = createTempNote(arg.title ?? 'Новая заметка');
              draft.data.unshift(tempNote);
            }
          )
        );

        try {
          const { data: createdNote } = await queryFulfilled;

          let finalNote = createdNote.data as Note;
          if (!finalNote.title) {
            finalNote = {
              id: finalNote.id,
              title: arg.title ?? '',
              payload: arg.payload ?? '',
              ownerId: finalNote.ownerId ?? '',
              haveAccess: finalNote.haveAccess ?? [],
              linkedWith: finalNote.linkedWith ?? [],
              createdAt: finalNote.createdAt ?? new Date().toISOString(),
              updatedAt: finalNote.updatedAt ?? new Date().toISOString(),
            } as Note;
          }

          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId, page: 1 },
              draft => {
                const tempIndex = draft.data.findIndex(note =>
                  note.id.startsWith('temp-')
                );
                if (tempIndex !== -1) {
                  draft.data[tempIndex] = finalNote;
                } else {
                  draft.data.unshift(finalNote);
                }
              }
            )
          );

          try {
            dispatch(
              notesApi.util.updateQueryData(
                'getUnposedNotes',
                { layoutId },
                draft => {
                  const tempIndex = draft.data.findIndex(note =>
                    note.id.startsWith('temp-')
                  );
                  if (tempIndex !== -1) {
                    draft.data[tempIndex] = finalNote;
                  } else {
                    draft.data.unshift(finalNote);
                  }
                }
              )
            );
          } catch (_e) {}
        } catch (_e) {
          patchResult.undo();
          unposedPatch.undo();
        }
      },
    }),

    updateNote: builder.mutation<UpdateNoteResponse, UpdateNoteRequest>({
      query: ({ noteId, ...body }) => ({
        url: '/notes/update',
        method: 'POST',
        body: { noteId, ...body },
      }),
      invalidatesTags: [],
      onQueryStarted: async (
        { noteId, title, payload },
        { dispatch, queryFulfilled, getState }
      ) => {
        const patchResults: Array<{ undo?: () => void }> = [];
        try {
          const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(
            getState() as RootState
          );
          const layouts = layoutsCache.data?.data || [];
          for (const l of layouts) {
            try {
              const pr = dispatch(
                notesApi.util.updateQueryData(
                  'getNotes',
                  { layoutId: l.id, page: 1 },
                  draft => {
                    const idx = draft.data.findIndex(n => n.id === noteId);
                    if (idx !== -1) {
                      if (title !== undefined) draft.data[idx].title = title;
                      if (payload !== undefined)
                        draft.data[idx].payload = payload;
                    }
                  }
                )
              );
              patchResults.push(pr);
            } catch (_e) {}

            try {
              const pr2 = dispatch(
                notesApi.util.updateQueryData(
                  'getPosedNotes',
                  { layoutId: l.id },
                  draft => {
                    const idx = draft.data.findIndex(n => n.id === noteId);
                    if (idx !== -1) {
                      if (title !== undefined) draft.data[idx].title = title;
                      if (payload !== undefined)
                        draft.data[idx].payload = payload;
                    }
                  }
                )
              );
              patchResults.push(pr2);
            } catch (_e) {}

            try {
              const pr3 = dispatch(
                notesApi.util.updateQueryData(
                  'getUnposedNotes',
                  { layoutId: l.id },
                  draft => {
                    const idx = draft.data.findIndex(n => n.id === noteId);
                    if (idx !== -1) {
                      if (title !== undefined) draft.data[idx].title = title;
                      if (payload !== undefined)
                        draft.data[idx].payload = payload;
                    }
                  }
                )
              );
              patchResults.push(pr3);
            } catch (_e) {}
          }
        } catch (_e) {}

        try {
          const { data: resp } = await queryFulfilled;
          const finalNote: Note | undefined = resp?.data;

          if (finalNote) {
            try {
              dispatch(
                updateTabNote({
                  noteId,
                  updates: {
                    title: finalNote.title,
                    payload: finalNote.payload,
                    updatedAt: finalNote.updatedAt,
                  },
                })
              );
            } catch (_e) {}

            try {
              const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(
                getState() as RootState
              );
              const layouts = layoutsCache.data?.data || [];
              for (const l of layouts) {
                try {
                  dispatch(
                    notesApi.util.updateQueryData(
                      'getNotes',
                      { layoutId: l.id, page: 1 },
                      draft => {
                        const idx = draft.data.findIndex(n => n.id === noteId);
                        if (idx !== -1) draft.data[idx] = finalNote as Note;
                      }
                    )
                  );
                } catch (_e) {}

                try {
                  dispatch(
                    notesApi.util.updateQueryData(
                      'getPosedNotes',
                      { layoutId: l.id },
                      draft => {
                        const idx = draft.data.findIndex(n => n.id === noteId);
                        if (idx !== -1) draft.data[idx] = finalNote as Note;
                      }
                    )
                  );
                } catch (_e) {}

                try {
                  dispatch(
                    notesApi.util.updateQueryData(
                      'getUnposedNotes',
                      { layoutId: l.id },
                      draft => {
                        const idx = draft.data.findIndex(n => n.id === noteId);
                        if (idx !== -1) draft.data[idx] = finalNote as Note;
                      }
                    )
                  );
                } catch (_e) {}
              }
            } catch (_e) {}
          }
        } catch (_e) {
          patchResults.forEach(p => p.undo && p.undo());
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
      onQueryStarted: async (
        { noteId },
        { dispatch, queryFulfilled, getState }
      ) => {
        const patchResults: Array<{ undo?: () => void }> = [];
        try {
          const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(
            getState() as RootState
          );
          const layouts = layoutsCache.data?.data || [];
          for (const l of layouts) {
            try {
              const pr = dispatch(
                notesApi.util.updateQueryData(
                  'getNotes',
                  { layoutId: l.id, page: 1 },
                  draft => {
                    draft.data = draft.data.filter(n => n.id !== noteId);
                  }
                )
              );
              patchResults.push(pr);
            } catch (_e) {}

            try {
              const pr2 = dispatch(
                notesApi.util.updateQueryData(
                  'getPosedNotes',
                  { layoutId: l.id },
                  draft => {
                    draft.data = draft.data.filter(n => n.id !== noteId);
                  }
                )
              );
              patchResults.push(pr2);
            } catch (_e) {}

            try {
              const pr3 = dispatch(
                notesApi.util.updateQueryData(
                  'getUnposedNotes',
                  { layoutId: l.id },
                  draft => {
                    draft.data = draft.data.filter(n => n.id !== noteId);
                  }
                )
              );
              patchResults.push(pr3);
            } catch (_e) {}
          }
        } catch (_e) {}

        try {
          await queryFulfilled;
        } catch (_e) {
          patchResults.forEach(p => p.undo && p.undo());
        }
      },
    }),

    getPosedNotes: builder.query<GetPosedNotesResponse, GetPosedNotesRequest>({
      query: ({ layoutId }) => `/notes/layout/graph/posed?layoutId=${layoutId}`,
      providesTags: (result, _e, arg) => [
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
      providesTags: (result, _e, arg) => [
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
      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const state = getState() as RootState;

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
        } catch (_e) {}

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
          } catch (_e) {}
        }

        const patchResults: Array<{ undo?: () => void }> = [];

        try {
          const pr = dispatch(
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
                        layoutId: arg.layoutId,
                        position: {
                          xPos: arg.xPos,
                          yPos: arg.yPos,
                        },
                      }
                    : ({
                        ...createTempNote(),
                        layoutId: arg.layoutId,
                        position: { xPos: arg.xPos, yPos: arg.yPos },
                      } as Note);
                  draft.data.push(newNote);
                }
              }
            )
          );
          patchResults.push(pr);

          const pr2 = dispatch(
            notesApi.util.updateQueryData(
              'getUnposedNotes',
              { layoutId: arg.layoutId },
              draft => {
                draft.data = draft.data.filter(note => note.id !== arg.noteId);
              }
            )
          );
          patchResults.push(pr2);
        } catch (_e) {}

        try {
          await queryFulfilled;
        } catch (_e) {
          patchResults.forEach(p => p.undo && p.undo());
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
      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const patchResults: Array<{ undo?: () => void }> = [];
        let originalTabLinkedWith: string[] | undefined;

        try {
          const state = getState() as RootState;
          const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(state);
          const layouts: Layout[] = layoutsCache.data?.data || [];

          for (const l of layouts) {
            try {
              const pr = dispatch(
                notesApi.util.updateQueryData(
                  'getPosedNotes',
                  { layoutId: l.id },
                  draft => {
                    const sourceNote = draft.data.find(
                      n => n.id === arg.firstNoteId
                    );
                    if (sourceNote) {
                      if (!sourceNote.linkedWith) sourceNote.linkedWith = [];
                      if (!sourceNote.linkedWith.includes(arg.secondNoteId)) {
                        sourceNote.linkedWith.push(arg.secondNoteId);
                      }
                    }
                  }
                )
              );
              patchResults.push(pr);
            } catch (_e) {}

            try {
              const pr2 = dispatch(
                notesApi.util.updateQueryData(
                  'getNotes',
                  { layoutId: l.id, page: 1 },
                  draft => {
                    if (!draft || !draft.data) return;
                    const source = draft.data.find(
                      n => n.id === arg.firstNoteId
                    );
                    if (source) {
                      if (!source.linkedWith) source.linkedWith = [];
                      if (!source.linkedWith.includes(arg.secondNoteId)) {
                        source.linkedWith.push(arg.secondNoteId);
                      }
                    }
                  }
                )
              );
              patchResults.push(pr2);
            } catch (_e) {}
          }

          try {
            const tabsState = state.tabs;
            if (tabsState?.openTabs) {
              const tab = tabsState.openTabs.find(
                t => t?.item?.type === 'note' && t?.item?.id === arg.firstNoteId
              );
              if (tab && tab.item && tab.item.note) {
                originalTabLinkedWith = tab.item.note.linkedWith;
                const newLinked = Array.isArray(originalTabLinkedWith)
                  ? [...originalTabLinkedWith]
                  : [];
                if (!newLinked.includes(arg.secondNoteId))
                  newLinked.push(arg.secondNoteId);
                dispatch(
                  updateTabNote({
                    noteId: arg.firstNoteId,
                    updates: { linkedWith: newLinked },
                  })
                );
              }
            }
          } catch (_e) {}
        } catch (_e) {}

        try {
          await queryFulfilled;
        } catch (_e) {
          patchResults.forEach(patchResult => patchResult.undo?.());
          try {
            if (originalTabLinkedWith !== undefined) {
              dispatch(
                updateTabNote({
                  noteId: arg.firstNoteId,
                  updates: { linkedWith: originalTabLinkedWith },
                })
              );
            }
          } catch (_e) {}
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
      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        const patchResults: Array<{ undo?: () => void }> = [];
        let originalTabLinkedWithDel: string[] | undefined;

        try {
          const state = getState() as RootState;
          const layoutsCache = layoutApi.endpoints.getMyLayouts.select()(state);
          const layouts: Layout[] = layoutsCache.data?.data || [];

          for (const l of layouts) {
            try {
              const pr = dispatch(
                notesApi.util.updateQueryData(
                  'getPosedNotes',
                  { layoutId: l.id },
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
              patchResults.push(pr);
            } catch (_e) {}

            try {
              const pr2 = dispatch(
                notesApi.util.updateQueryData(
                  'getNotes',
                  { layoutId: l.id, page: 1 },
                  draft => {
                    if (!draft || !draft.data) return;
                    const source = draft.data.find(
                      n => n.id === arg.firstNoteId
                    );
                    if (source && source.linkedWith) {
                      source.linkedWith = source.linkedWith.filter(
                        id => id !== arg.secondNoteId
                      );
                    }
                  }
                )
              );
              patchResults.push(pr2);
            } catch (_e) {}
          }

          try {
            const tabsState = state.tabs;
            if (tabsState?.openTabs) {
              const tab = tabsState.openTabs.find(
                t => t?.item?.type === 'note' && t?.item?.id === arg.firstNoteId
              );
              if (tab && tab.item && tab.item.note) {
                originalTabLinkedWithDel = tab.item.note.linkedWith;
                const newLinked = Array.isArray(originalTabLinkedWithDel)
                  ? originalTabLinkedWithDel.filter(
                      id => id !== arg.secondNoteId
                    )
                  : [];
                dispatch(
                  updateTabNote({
                    noteId: arg.firstNoteId,
                    updates: { linkedWith: newLinked },
                  })
                );
              }
            }
          } catch (_e) {}
        } catch (_e) {}

        try {
          await queryFulfilled;
        } catch (_e) {
          patchResults.forEach(patchResult => patchResult.undo?.());
          try {
            if (originalTabLinkedWithDel !== undefined) {
              dispatch(
                updateTabNote({
                  noteId: arg.firstNoteId,
                  updates: { linkedWith: originalTabLinkedWithDel },
                })
              );
            }
          } catch (_e) {}
        }
      },
    }),

    searchNotes: builder.query<SearchNotesResponse, SearchNotesRequest>({
      query: ({ search }) =>
        `/notes/search?search=${encodeURIComponent(search)}`,
      providesTags: (result, _e, arg) => [
        { type: 'Notes', id: `search-${arg.search}` },
        ...(result?.data?.map(note => ({
          type: 'Notes' as const,
          id: note.id,
        })) || []),
        'Notes',
      ],
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
} = notesApi;
