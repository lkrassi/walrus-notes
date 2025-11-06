import React from 'react';
import cn from 'shared/lib/cn';

interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingText?: string;
  loadMoreText?: string;
  className?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  loadingText = 'Загрузка...',
  loadMoreText = 'Загрузить еще',
  className = '',
}) => {
  if (!hasMore) return null;

  return (
    <div className={cn('mt-1', className)}>
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className={cn(
          'text-primary',
          'hover:text-primary-dark',
          'rounded',
          'px-2',
          'py-1',
          'text-sm',
          'transition-colors',
          'disabled:opacity-50'
        )}
      >
        {isLoading ? loadingText : loadMoreText}
      </button>
    </div>
  );
};
