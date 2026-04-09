type NoteLike = {
  payload?: string | null;
  draft?: string | null;
};

export function hasUnsavedChanges(
  note: NoteLike | null | undefined,
  draft?: string | null
): boolean {
  if (!note) {
    return false;
  }

  const payload = note.payload ?? '';
  const localDraft = (draft ?? '').trim();
  const serverDraft = (note.draft ?? '').trim();

  const hasUnsavedLocal = localDraft.length > 0 && localDraft !== payload;
  const hasUnsavedServer = serverDraft.length > 0 && serverDraft !== payload;

  return hasUnsavedLocal || hasUnsavedServer;
}
