import { useGetMyLayoutsQuery } from '@/entities/layout';

export const useFolderSelectData = () => {
  const { data, isLoading, isFetching, error, hasData } = useGetMyLayoutsQuery(
    undefined,
    {
      selectFromResult: ({ data, isLoading, isFetching, error }) => {
        const layouts = data?.data || [];

        return {
          data: {
            nonMainLayouts: layouts.filter(layout => !layout.isMain),
          },
          isLoading,
          isFetching,
          error,
          hasData: !!data,
        };
      },
    }
  );

  return {
    data,
    isLoading,
    isFetching,
    error,
    isInitialLoading: isLoading && !hasData,
    isRefreshing: isFetching && hasData,
  };
};
