import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { startLoading, stopLoading, setLoading } from 'widgets/model/stores/slices/loaderSlice';

export const useLoader = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.loader.isLoading);

  const showLoader = useCallback(() => {
    dispatch(startLoading());
  }, [dispatch]);

  const hideLoader = useCallback(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  const setLoader = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  return {
    isLoading,
    showLoader,
    hideLoader,
    setLoader,
  };
};
