import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDrafts, removeDraft, setDraft } from './slice';

type DraftsStateLike = {
  drafts?: Record<string, string>;
};

export const useDrafts = () => {
  const dispatch = useDispatch();
  const drafts = useSelector((state: DraftsStateLike) => state.drafts ?? {});

  const set = useCallback(
    (noteId: string, text: string) => {
      dispatch(setDraft({ noteId, text }));
    },
    [dispatch]
  );

  const remove = useCallback(
    (noteId: string) => {
      dispatch(removeDraft({ noteId }));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearDrafts());
  }, [dispatch]);

  return {
    drafts,
    set,
    remove,
    clear,
  };
};
