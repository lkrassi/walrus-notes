import { getLayoutAccess, useGetMyLayoutsQuery } from '@/entities';

interface UseCreateNoteFormDataParams {
  layoutId: string;
}

type CreateNoteFormData = {
  canWrite: boolean;
};

export const useCreateNoteFormData = ({
  layoutId,
}: UseCreateNoteFormDataParams) => {
  const {
    data: layoutsResponse,
    isLoading,
    error,
  } = useGetMyLayoutsQuery(undefined);

  const currentLayout = (layoutsResponse?.data || []).find(
    l => l.id === layoutId
  );

  const data: CreateNoteFormData = {
    canWrite: currentLayout ? getLayoutAccess(currentLayout).canWrite : true,
  };

  return {
    data,
    isLoading,
    error,
  } as const;
};
