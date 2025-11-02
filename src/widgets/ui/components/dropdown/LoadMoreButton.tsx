import React from 'react';

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
    <div className={`mt-1 ${className}`}>
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className='text-primary hover:text-primary-dark rounded px-2 py-1 text-sm transition-colors disabled:opacity-50'
      >
        {isLoading ? loadingText : loadMoreText}
      </button>
    </div>
  );
};
