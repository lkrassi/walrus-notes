import { useCallback, useState } from 'react';

export type ModalOptions = {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export type ModalState = {
  isOpen: boolean;
  content: React.ReactNode | null;
  options: ModalOptions;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: {},
  });

  const openModal = useCallback((content: React.ReactNode, options: ModalOptions = {}) => {
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
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const updateModalContent = useCallback((content: React.ReactNode) => {
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
