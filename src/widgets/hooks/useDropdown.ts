import { useCallback, useEffect, useState } from 'react';

interface UseDropdownBaseOptions<T> {
  items: T[];
  isOpen: boolean;
}

interface UseDropdownWithPaginationOptions<T>
  extends UseDropdownBaseOptions<T> {
  enablePagination: true;
  hasMore?: boolean;
  onLoadMore?: (page: number) => Promise<void> | void;
}

interface UseDropdownWithoutPaginationOptions<T>
  extends UseDropdownBaseOptions<T> {
  enablePagination?: false;
}

type UseDropdownOptions<T> =
  | UseDropdownWithPaginationOptions<T>
  | UseDropdownWithoutPaginationOptions<T>;

interface UseDropdownReturn<T> {
  visibleItems: T[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useDropdown = <T>(
  options: UseDropdownOptions<T>
): UseDropdownReturn<T> => {
  const { items, isOpen, enablePagination = false } = options;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {}, [items, isOpen, enablePagination, currentPage]);

  const loadMore = useCallback(async () => {
    if (!enablePagination) return;

    const paginationOptions = options as UseDropdownWithPaginationOptions<T>;

    if (
      !paginationOptions.hasMore ||
      isLoadingMore ||
      !paginationOptions.onLoadMore
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await paginationOptions.onLoadMore(nextPage);
      setCurrentPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, enablePagination, isLoadingMore, options]);

  const hasMore = enablePagination
    ? (options as UseDropdownWithPaginationOptions<T>).hasMore || false
    : false;

  return {
    visibleItems: items,
    isLoadingMore: enablePagination ? isLoadingMore : false,
    hasMore: isOpen ? hasMore : false,
    loadMore,
  };
};
