import { useCallback, type MouseEvent, type ReactElement } from 'react';
import { useModalContext } from './modalContext';
import type { ModalOptions } from './useModal';

export const useModalActions = () => {
  const { openModal } = useModalContext();

  const openModalFromTrigger = useCallback(
    (content: ReactElement, options: ModalOptions) => {
      return (event: MouseEvent<HTMLElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();

        openModal(content, {
          ...options,
          triggerPosition: {
            x: buttonRect.left + buttonRect.width / 2,
            y: buttonRect.top + buttonRect.height / 2,
            width: buttonRect.width,
            height: buttonRect.height,
          },
        });
      };
    },
    [openModal]
  );

  return {
    openModalFromTrigger,
  };
};
