import type { GenerateLinkRequest } from '@/entities';
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
  const [generateLink] = useGenerateLinkMutation<GenerateLinkRequest>();

  const resetLink = useCallback(() => {
    dispatch(resetGeneratedLink());
  }, [dispatch]);

  return {
    generatedLink,
    generateLink,
    resetLink,
  };
};
