export const reportDraftSyncError = (
  scope: string,
  error: unknown,
  meta?: Record<string, unknown>
) => {
  if (!import.meta.env.DEV) {
    return;
  }

  const payload = meta ? { ...meta, error } : { error };
  console.warn(`[draft-sync] ${scope}`, payload);
};
