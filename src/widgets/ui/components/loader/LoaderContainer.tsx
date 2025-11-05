import React from 'react';
import { useAppSelector } from 'widgets/hooks/redux';
import { Loader } from './Loader';

interface LoaderContainerProps {
  loadingKey?: string;
}

export const LoaderContainer: React.FC<LoaderContainerProps> = ({ loadingKey }) => {
  const isLoading = useAppSelector(state => state.loader.isLoading);
  const loadingKeys = useAppSelector(state => state.loader.loadingKeys);

  if (loadingKey) {
    if (!loadingKeys[loadingKey]) {
      return null;
    }
  } else {
    if (!isLoading) {
      return null;
    }
  }

  return <Loader />;
};
