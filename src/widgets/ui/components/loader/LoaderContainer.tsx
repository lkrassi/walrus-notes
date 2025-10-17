import React from 'react';
import { useAppSelector } from 'widgets/hooks/redux';
import { Loader } from './Loader';

export const LoaderContainer: React.FC = () => {
  const isLoading = useAppSelector(state => state.loader.isLoading);

  if (!isLoading) {
    return null;
  }

  return <Loader />;
};
