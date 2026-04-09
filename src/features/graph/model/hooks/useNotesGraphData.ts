import { getLayoutAccess, useGetMyLayoutsQuery } from '@/entities';

interface UseNotesGraphDataParams {
  layoutId: string;
}

type NotesGraphData = {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
};

const DEFAULT_ACCESS: NotesGraphData = {
  canRead: true,
  canWrite: true,
  canEdit: true,
};

export const useNotesGraphData = ({ layoutId }: UseNotesGraphDataParams) => {
  const { data, isLoading, error } = useGetMyLayoutsQuery(undefined, {
    selectFromResult: ({ data, isLoading, error }) => {
      const currentLayout = (data?.data || []).find(l => l.id === layoutId);
      return {
        data: currentLayout ? getLayoutAccess(currentLayout) : DEFAULT_ACCESS,
        isLoading,
        error,
      };
    },
  });

  return {
    data,
    isLoading,
    error,
  } as const;
};
