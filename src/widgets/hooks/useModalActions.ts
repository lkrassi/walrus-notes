// hooks/useModalActions.ts
import { useCallback } from 'react';
import type { ModalOptions } from 'widgets/hooks/useModal';
import { useModalContext } from 'widgets/ui';

export const useModalActions = () => {
  const { openModal } = useModalContext();

  // Для кнопок, которые принимают event
  const createAnimatedOpener = useCallback(
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

  // Для функций, которые принимают параметры (например layoutId)
  const createParametrizedAnimatedOpener = useCallback(
    (
      getContent: (param: string) => React.ReactNode,
      getOptions: (param: string) => ModalOptions
    ) => {
      return (param: string, event: React.MouseEvent<HTMLElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();

        openModal(getContent(param), {
          ...getOptions(param),
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
    createAnimatedOpener,
    createParametrizedAnimatedOpener,
  };
};
