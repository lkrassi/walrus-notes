import { createContext, type ReactNode } from 'react';
import type { ModalOptions, ModalState } from 'widgets/hooks/useModal';

export interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: ReactNode) => void;
  modalState: ModalState;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);
