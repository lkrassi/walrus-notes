import { useGetMyLayoutsQuery } from '@/entities/layout';
import { getLoadingState } from '@/shared/lib/core';

interface UseMainContentLayoutsDataParams {
  isMobile: boolean;
  variant: 'empty' | 'unsupported';
}

export const useMainContentLayoutsData = ({
  isMobile,
  variant,
}: UseMainContentLayoutsDataParams) => {
  const { data, isLoading, error, hasData } = useGetMyLayoutsQuery(undefined, {
    skip: !isMobile || variant !== 'empty',
    selectFromResult: ({ data, isLoading, error }) => ({
      data: {
        nonMainLayouts: (data?.data || []).filter(layout => !layout.isMain),
      },
      isLoading,
      error,
      hasData: !!data,
    }),
  });

  const { isInitialLoading } = getLoadingState(
    isLoading,
    hasData ? data : null
  );

  return {
    data,
    isLoading,
    error,
    isInitialLoading,
  };
};
