import { createContext } from 'react';
import type { ModalOptions, ModalState } from 'widgets/hooks/useModal';

export interface ModalContextType {
  openModal: (content: React.ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: React.ReactNode) => void;
  modalState: ModalState;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);
