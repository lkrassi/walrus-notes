import type { GenerateLinkRequest } from '@/entities';
import {
  resetGeneratedLink,
  selectLastGeneratedLink,
  useGenerateLinkMutation,
} from '@/entities';
import { useAppDispatch, useAppSelector } from '@/widgets/hooks';
import { useCallback } from 'react';

export const useShareLink = () => {
  const dispatch = useAppDispatch();
  const generatedLink = useAppSelector(state =>
    selectLastGeneratedLink(
      state as Parameters<typeof selectLastGeneratedLink>[0]
    )
  );
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
