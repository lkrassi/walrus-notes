import { useCallback, useState, type ReactElement } from 'react';

export interface TriggerPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ModalOptions = {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  triggerPosition?: TriggerPosition;
  mobileContentPadding?: '0' | '12px' | '16px' | '24px';
};

export type ModalState = {
  isOpen: boolean;
  content: ReactElement | null;
  options: ModalOptions;
};

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: {},
  });

  const openModal = useCallback(
    (content: ReactElement, options: ModalOptions = {}) => {
      setModalState({
        isOpen: true,
        content,
        options: {
          closeOnOverlayClick: true,
          closeOnEscape: true,
          showCloseButton: true,
          size: 'md',
          ...options,
        },
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const updateModalContent = useCallback((content: ReactElement) => {
    setModalState(prev => ({
      ...prev,
      content,
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    updateModalContent,
  };
};
