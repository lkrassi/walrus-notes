export type WSEventName =
  | 'UPDATE_DRAFT_REQUEST'
  | 'COMMIT_DRAFT_REQUEST'
  | string;

export interface WSEvent<T = unknown> {
  event: WSEventName;
  payload: T;
}

export interface UpdateDraftPayload {
  noteId: string;
  newDraft: string;
}

export interface CommitDraftPayload {
  noteId: string;
}

export const makeUpdateDraft = (
  noteId: string,
  newDraft: string
): WSEvent<UpdateDraftPayload> => ({
  event: 'UPDATE_DRAFT_REQUEST',
  payload: { noteId, newDraft },
});

export const makeCommitDraft = (
  noteId: string
): WSEvent<CommitDraftPayload> => ({
  event: 'COMMIT_DRAFT_REQUEST',
  payload: { noteId },
});
