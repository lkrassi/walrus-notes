import { createContext, useContext, type ReactNode } from 'react';
import type { ModalOptions, ModalState } from './useModal';

export interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: ReactNode) => void;
  modalState: ModalState;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};
