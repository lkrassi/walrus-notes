import { useModalContext } from '@/app/providers/modal';
import type { ModalOptions } from '@/app/providers/modal/useModal';
import { useCallback, type ReactNode } from 'react';

export const useAnimatedModal = () => {
  const { openModal } = useModalContext();

  const openAnimatedModal = useCallback(
    (
      content: ReactNode,
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
