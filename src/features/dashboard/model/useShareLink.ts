import {
  resetGeneratedLink,
  selectLastGeneratedLink,
  useGenerateLinkMutation,
} from '@/entities';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useShareLink = () => {
  const dispatch = useDispatch();
  const generatedLink = useSelector(selectLastGeneratedLink);
  const [generateLink, { error }] = useGenerateLinkMutation();

  const resetLink = useCallback(() => {
    dispatch(resetGeneratedLink());
  }, [dispatch]);

  return {
    generatedLink,
    generateLink,
    error,
    resetLink,
  };
};
