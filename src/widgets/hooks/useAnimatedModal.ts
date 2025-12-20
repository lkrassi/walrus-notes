import { useCallback } from 'react';
import type { ModalOptions } from 'widgets/hooks/useModal';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';

export const useAnimatedModal = () => {
  const { openModal } = useModalContext();

  const openAnimatedModal = useCallback(
    (
      content: React.ReactNode,
      options: ModalOptions,
      triggerElement?: HTMLElement | null
    ) => {
      let triggerPosition = options.triggerPosition;

      if (triggerElement && !triggerPosition) {
        const rect = triggerElement.getBoundingClientRect();
        triggerPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }

      openModal(content, {
        ...options,
        triggerPosition,
      });
    },
    [openModal]
  );

  return { openAnimatedModal };
};
