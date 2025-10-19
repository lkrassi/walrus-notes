import React from 'react';
import { useAppSelector } from 'widgets/hooks/redux';
import { Loader } from './Loader';

interface LoaderContainerProps {
  loadingKey?: string;
}

export const LoaderContainer: React.FC<LoaderContainerProps> = ({ loadingKey }) => {
  const isLoading = useAppSelector(state => state.loader.isLoading);
  const loadingKeys = useAppSelector(state => state.loader.loadingKeys);

  // If a specific loading key is provided, check only that key
  if (loadingKey) {
    if (!loadingKeys[loadingKey]) {
      return null;
    }
  } else {
    // Otherwise, use the global loading state
    if (!isLoading) {
      return null;
    }
  }

  return <Loader />;
};
