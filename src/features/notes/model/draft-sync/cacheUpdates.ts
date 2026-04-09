import { notesApi } from '@/entities';
import type { Layout } from '@/entities/layout';

type Dispatch = (action: unknown) => unknown;

type NoteCacheUpdates = {
  title?: string;
  payload?: string;
  draft?: string | undefined;
};

const QUERY_NAMES = ['getNotes', 'getPosedNotes', 'getUnposedNotes'] as const;

const getQueryArgs = (
  queryName: (typeof QUERY_NAMES)[number],
  layoutId: string
) => {
  if (queryName === 'getNotes') {
    return { layoutId, page: 1 };
  }

  return { layoutId };
};

export const updateNoteCacheFields = ({
  dispatch,
  layouts,
  layoutIds,
  noteId,
  updates,
}: {
  dispatch: Dispatch;
  layouts?: Layout[];
  layoutIds?: string[];
  noteId: string;
  updates: NoteCacheUpdates;
}) => {
  const ids =
    layoutIds && layoutIds.length > 0
      ? layoutIds
      : (layouts ?? []).map(layout => layout.id);

  if (!noteId || ids.length === 0) {
    return;
  }

  for (const layoutId of ids) {
    for (const queryName of QUERY_NAMES) {
      dispatch(
        notesApi.util.updateQueryData(
          queryName,
          getQueryArgs(queryName, layoutId),
          draftState => {
            const idx = draftState.data.findIndex(note => note.id === noteId);
            if (idx === -1) {
              return;
            }

            if (updates.title !== undefined) {
              draftState.data[idx].title = updates.title;
            }

            if (updates.payload !== undefined) {
              draftState.data[idx].payload = updates.payload;
            }

            if ('draft' in updates) {
              draftState.data[idx].draft = updates.draft;
            }
          }
        )
      );
    }
  }
};

export const applyDraftToNoteCaches = ({
  dispatch,
  layouts,
  noteId,
  draft,
}: {
  dispatch: Dispatch;
  layouts: Layout[];
  noteId: string;
  draft: string;
}) => {
  updateNoteCacheFields({
    dispatch,
    layouts,
    noteId,
    updates: {
      draft: draft || '',
    },
  });
};

export const applyCommittedPayloadToNoteCaches = ({
  dispatch,
  layouts,
  noteId,
  payload,
}: {
  dispatch: Dispatch;
  layouts: Layout[];
  noteId: string;
  payload: string;
}) => {
  updateNoteCacheFields({
    dispatch,
    layouts,
    noteId,
    updates: {
      payload,
      draft: undefined,
    },
  });
};
