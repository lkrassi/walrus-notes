import { useGetNotesQuery } from '@/entities/note';

interface UseFolderCardDataParams {
  layoutId: string;
}

export const useFolderCardData = ({ layoutId }: UseFolderCardDataParams) => {
  const { data, isLoading, error } = useGetNotesQuery(
    {
      layoutId,
      page: 1,
    },
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data: {
          notesCount: data?.data?.length || 0,
        },
        isLoading,
        error,
      }),
    }
  );

  return { data, isLoading, error };
};
