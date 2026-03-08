import { useCallback, useState, type ReactNode } from 'react';

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
  content: ReactNode | null;
  options: ModalOptions;
};

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: {},
  });

  const openModal = useCallback(
    (content: ReactNode, options: ModalOptions = {}) => {
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

  const updateModalContent = useCallback((content: ReactNode) => {
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
