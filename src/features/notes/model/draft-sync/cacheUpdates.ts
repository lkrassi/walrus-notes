import { notesApi } from '@/entities';
import type { Layout } from '@/entities/layout';

type Dispatch = (action: unknown) => unknown;

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
  for (const layout of layouts) {
    dispatch(
      notesApi.util.updateQueryData(
        'getNotes',
        { layoutId: layout.id, page: 1 },
        draft => {
          const idx = draft.data.findIndex(note => note.id === noteId);
          if (idx === -1) {
            return;
          }

          draft.data[idx].payload = payload;
          draft.data[idx].draft = undefined;
        }
      )
    );

    dispatch(
      notesApi.util.updateQueryData(
        'getPosedNotes',
        { layoutId: layout.id },
        draft => {
          const idx = draft.data.findIndex(note => note.id === noteId);
          if (idx === -1) {
            return;
          }

          draft.data[idx].payload = payload;
          draft.data[idx].draft = undefined;
        }
      )
    );

    dispatch(
      notesApi.util.updateQueryData(
        'getUnposedNotes',
        { layoutId: layout.id },
        draft => {
          const idx = draft.data.findIndex(note => note.id === noteId);
          if (idx === -1) {
            return;
          }

          draft.data[idx].payload = payload;
          draft.data[idx].draft = undefined;
        }
      )
    );
  }
};
