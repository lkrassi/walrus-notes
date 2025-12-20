import { useCallback } from 'react';
import type { ModalOptions } from 'widgets/hooks/useModal';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';

export const useModalActions = () => {
  const { openModal } = useModalContext();

  const openModalFromTrigger = useCallback(
    (content: React.ReactNode, options: ModalOptions) => {
      return (event: React.MouseEvent<HTMLElement>) => {
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
