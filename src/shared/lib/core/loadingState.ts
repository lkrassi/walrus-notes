export const getLoadingState = (isLoading: boolean, data: unknown) => ({
  isInitialLoading: isLoading && !data,
  isRefreshing: isLoading && !!data,
});
