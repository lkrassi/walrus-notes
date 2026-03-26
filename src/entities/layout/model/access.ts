import type { Layout } from './types';

export const getLayoutAccess = (layout: Layout) => {
  const p = layout.permission;

  return {
    canRead: !!p?.canRead,
    canWrite: !!p?.canWrite,
    canEdit: !!p?.canEdit,
  };
};
