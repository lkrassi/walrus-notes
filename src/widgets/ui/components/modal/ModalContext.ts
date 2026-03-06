import type { ModalOptions, ModalState } from '@/app/providers/modal';
import { createContext, type ReactNode } from 'react';

export interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: ReactNode) => void;
  modalState: ModalState;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);
