import { useCallback } from 'react';

export const useTabMiddleClickClose = (onClose: () => void) => {
  return useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );
};
