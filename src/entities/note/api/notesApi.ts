import { removeDraft, setDraft } from '@/entities/draft';
import { layoutApi } from '@/entities/layout';
import type { Note } from '@/entities/note';
import { updateTabNote } from '@/entities/tab';
import { apiSlice } from '@/shared/api';

type LocalRootState = {
  api: ReturnType<typeof apiSlice.reducer>;
  [k: string]: unknown;
};

type UndoPatch = { undo: () => void };

type DraftStateLike = {
  drafts?: Record<string, string>;
};

const hydrateServerDrafts = (
  dispatch: (action: unknown) => unknown,
  getState: () => unknown,
  source: string,
  notes: Note[]
) => {
  const state = getState() as DraftStateLike;
  const currentDrafts = state.drafts ?? {};

  for (const note of notes) {
    const serverDraft = note.draft?.trim() ?? '';

    if (!serverDraft.length) {
      if (currentDrafts[note.id]) {
        dispatch(removeDraft({ noteId: note.id }));
      }
      continue;
    }

    if (currentDrafts[note.id] === serverDraft) {
      continue;
    }

    dispatch(setDraft({ noteId: note.id, text: serverDraft }));
  }
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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          hydrateServerDrafts(dispatch, getState, 'getNotes', data.data);
        } catch (_e) {}
      },
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

        const movedToLayout: Note = {
          ...movedNote,
          layoutId: toLayoutId,
          position: undefined,
        };

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

        const removeFromSourcePosedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getPosedNotes',
            { layoutId: fromLayoutId },
            draft => {
              if (!draft) return;
              draft.data = draft.data.filter(n => n.id !== noteId);
            }
          )
        );

        const removeFromSourceUnposedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getUnposedNotes',
            { layoutId: fromLayoutId },
            draft => {
              if (!draft) return;
              draft.data = draft.data.filter(n => n.id !== noteId);
            }
          )
        );

        const removeFromTargetPosedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getPosedNotes',
            { layoutId: toLayoutId },
            draft => {
              if (!draft) return;
              draft.data = draft.data.filter(n => n.id !== noteId);
            }
          )
        );

        const addToTargetUnposedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getUnposedNotes',
            { layoutId: toLayoutId },
            draft => {
              if (!draft) return;
              if (draft.data.some(n => n.id === noteId)) return;
              draft.data.unshift(movedToLayout);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          removePatch.undo();
          addPatch.undo();
          removeFromSourcePosedPatch.undo();
          removeFromSourceUnposedPatch.undo();
          removeFromTargetPosedPatch.undo();
          addToTargetUnposedPatch.undo();
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
        const tempUnposedNote: Note = {
          ...temp,
          layoutId: arg.layoutId,
        };

        const patch = dispatch(
          notesApi.util.updateQueryData(
            'getNotes',
            { layoutId: arg.layoutId, page: 1 },
            draft => {
              draft.data.unshift(temp);
            }
          )
        );

        const unposedPatch = dispatch(
          notesApi.util.updateQueryData(
            'getUnposedNotes',
            { layoutId: arg.layoutId },
            draft => {
              if (!draft) return;
              draft.data.unshift(tempUnposedNote);
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
                    title: responseTitle?.length ? responseTitle : temp.title,
                  };
                }
              }
            )
          );

          dispatch(
            notesApi.util.updateQueryData(
              'getUnposedNotes',
              { layoutId: arg.layoutId },
              draft => {
                if (!draft) return;
                const i = draft.data.findIndex(
                  n => n.id === tempUnposedNote.id
                );
                if (i !== -1) {
                  const responseTitle = data.data.title?.trim();
                  draft.data[i] = {
                    ...data.data,
                    title: responseTitle?.length
                      ? responseTitle
                      : tempUnposedNote.title,
                    layoutId: data.data.layoutId || arg.layoutId,
                  };
                }
              }
            )
          );
        } catch {
          patch.undo();
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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as LocalRootState;
        const layouts =
          layoutApi.endpoints.getMyLayouts.select()(state).data?.data || [];

        const patches: UndoPatch[] = [];

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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          hydrateServerDrafts(dispatch, getState, 'getPosedNotes', data.data);
        } catch (_e) {}
      },
      providesTags: (_result, _error, arg) => [
        { type: 'Notes', id: `posed-${arg.layoutId}` },
      ],
    }),

    getUnposedNotes: builder.query<
      GetUnposedNotesResponse,
      GetUnposedNotesRequest
    >({
      query: ({ layoutId }) =>
        `/notes/layout/graph/unposed?layoutId=${layoutId}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          hydrateServerDrafts(dispatch, getState, 'getUnposedNotes', data.data);
        } catch (_e) {}
      },
      providesTags: (_result, _error, arg) => [
        { type: 'Notes', id: `unposed-${arg.layoutId}` },
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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as LocalRootState;
        const layouts =
          layoutApi.endpoints.getMyLayouts.select()(state).data?.data || [];
        const allLayoutIds = layouts.map(layout => layout.id);

        const unposedCache = notesApi.endpoints.getUnposedNotes.select({
          layoutId: arg.layoutId,
        })(state);
        const noteToMove = unposedCache.data?.data?.find(
          note => note.id === arg.noteId
        );

        const patches: UndoPatch[] = [
          dispatch(
            notesApi.util.updateQueryData(
              'getUnposedNotes',
              { layoutId: arg.layoutId },
              draft => {
                if (!draft) return;
                draft.data = draft.data.filter(note => note.id !== arg.noteId);
              }
            )
          ),
          dispatch(
            notesApi.util.updateQueryData(
              'getPosedNotes',
              { layoutId: arg.layoutId },
              draft => {
                if (!draft) return;

                const idx = draft.data.findIndex(
                  note => note.id === arg.noteId
                );
                if (idx !== -1) {
                  draft.data[idx] = {
                    ...draft.data[idx],
                    position: { xPos: arg.xPos, yPos: arg.yPos },
                  };
                  return;
                }

                if (!noteToMove) return;

                draft.data.unshift({
                  ...noteToMove,
                  layoutId: noteToMove.layoutId || arg.layoutId,
                  position: { xPos: arg.xPos, yPos: arg.yPos },
                });
              }
            )
          ),
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: arg.layoutId, page: 1 },
              draft => {
                if (!draft) return;
                const note = draft.data.find(n => n.id === arg.noteId);
                if (!note) return;
                note.position = { xPos: arg.xPos, yPos: arg.yPos };
              }
            )
          ),
        ];

        for (const layoutId of allLayoutIds) {
          if (layoutId === arg.layoutId) continue;

          patches.push(
            dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId },
                draft => {
                  if (!draft) return;
                  const idx = draft.data.findIndex(
                    note => note.id === arg.noteId
                  );
                  if (idx === -1) {
                    return;
                  }

                  draft.data[idx] = {
                    ...draft.data[idx],
                    position: { xPos: arg.xPos, yPos: arg.yPos },
                  };
                }
              )
            )
          );
        }

        try {
          await queryFulfilled;

          dispatch(
            notesApi.util.invalidateTags(
              allLayoutIds.map(layoutId => ({
                type: 'Notes' as const,
                id: `posed-${layoutId}`,
              }))
            )
          );
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Notes', id: `posed-${arg.layoutId}` },
        { type: 'Notes', id: `unposed-${arg.layoutId}` },
      ],
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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as LocalRootState;
        const layouts =
          layoutApi.endpoints.getMyLayouts.select()(state).data?.data || [];
        const allLayoutIds = layouts.map(layout => layout.id);

        const patches: UndoPatch[] = [];

        for (const layoutId of allLayoutIds) {
          patches.push(
            dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId },
                draft => {
                  if (!draft) return;

                  const source = draft.data.find(n => n.id === arg.firstNoteId);
                  const target = draft.data.find(
                    n => n.id === arg.secondNoteId
                  );
                  if (!source || !target) return;

                  const out = source.linkedWithOut ?? [];
                  if (!out.includes(arg.secondNoteId)) {
                    source.linkedWithOut = [...out, arg.secondNoteId];
                  }

                  const incoming = target.linkedWithIn ?? [];
                  if (!incoming.includes(arg.firstNoteId)) {
                    target.linkedWithIn = [...incoming, arg.firstNoteId];
                  }
                }
              )
            )
          );
        }

        patches.push(
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: arg.layoutId, page: 1 },
              draft => {
                if (!draft) return;

                const source = draft.data.find(n => n.id === arg.firstNoteId);
                const target = draft.data.find(n => n.id === arg.secondNoteId);

                if (source) {
                  const out = source.linkedWithOut ?? [];
                  if (!out.includes(arg.secondNoteId)) {
                    source.linkedWithOut = [...out, arg.secondNoteId];
                  }
                }

                if (target) {
                  const incoming = target.linkedWithIn ?? [];
                  if (!incoming.includes(arg.firstNoteId)) {
                    target.linkedWithIn = [...incoming, arg.firstNoteId];
                  }
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Notes', id: arg.layoutId },
        { type: 'Notes', id: `posed-${arg.layoutId}` },
      ],
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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as LocalRootState;
        const layouts =
          layoutApi.endpoints.getMyLayouts.select()(state).data?.data || [];
        const allLayoutIds = layouts.map(layout => layout.id);

        const patches: UndoPatch[] = [];

        for (const layoutId of allLayoutIds) {
          patches.push(
            dispatch(
              notesApi.util.updateQueryData(
                'getPosedNotes',
                { layoutId },
                draft => {
                  if (!draft) return;

                  const source = draft.data.find(n => n.id === arg.firstNoteId);
                  const target = draft.data.find(
                    n => n.id === arg.secondNoteId
                  );

                  if (source?.linkedWithOut) {
                    source.linkedWithOut = source.linkedWithOut.filter(
                      id => id !== arg.secondNoteId
                    );
                  }

                  if (target?.linkedWithIn) {
                    target.linkedWithIn = target.linkedWithIn.filter(
                      id => id !== arg.firstNoteId
                    );
                  }
                }
              )
            )
          );
        }

        patches.push(
          dispatch(
            notesApi.util.updateQueryData(
              'getNotes',
              { layoutId: arg.layoutId, page: 1 },
              draft => {
                if (!draft) return;

                const source = draft.data.find(n => n.id === arg.firstNoteId);
                const target = draft.data.find(n => n.id === arg.secondNoteId);

                if (source?.linkedWithOut) {
                  source.linkedWithOut = source.linkedWithOut.filter(
                    id => id !== arg.secondNoteId
                  );
                }

                if (target?.linkedWithIn) {
                  target.linkedWithIn = target.linkedWithIn.filter(
                    id => id !== arg.firstNoteId
                  );
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Notes', id: arg.layoutId },
        { type: 'Notes', id: `posed-${arg.layoutId}` },
      ],
    }),

    searchNotes: builder.query<SearchNotesResponse, SearchNotesRequest>({
      query: ({ search }) =>
        `/notes/search?search=${encodeURIComponent(search)}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          hydrateServerDrafts(dispatch, getState, 'searchNotes', data.data);
        } catch (_e) {}
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
  useSearchNotesQuery,
  useLazySearchNotesQuery,
  useDragNoteMutation,
} = notesApi;
