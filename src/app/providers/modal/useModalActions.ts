import { useModalContext } from '@/app/providers/modal/ModalProvider';
import type { ModalOptions } from '@/app/providers/modal/useModal';
import { useCallback, type MouseEvent, type ReactNode } from 'react';

export const useModalActions = () => {
  const { openModal } = useModalContext();

  const openModalFromTrigger = useCallback(
    (content: ReactNode, options: ModalOptions) => {
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
