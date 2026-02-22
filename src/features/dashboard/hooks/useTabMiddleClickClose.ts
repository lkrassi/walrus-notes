import { useCallback, type MouseEvent } from 'react';

export const useTabMiddleClickClose = (onClose: () => void) => {
  return useCallback(
    (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );
};
