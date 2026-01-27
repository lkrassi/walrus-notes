import { createContext, useContext, type ReactNode } from 'react';
import {
  useModal,
  type ModalOptions,
  type ModalState,
} from 'widgets/hooks/useModal';
import { Modal } from './Modal';

interface ModalContextType {
  openModal: (content: React.ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: React.ReactNode) => void;
  modalState: ModalState;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const { modalState, openModal, closeModal, updateModalContent } = useModal();

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        updateModalContent,
        modalState,
      }}
    >
      {children}
      <Modal modalState={modalState} onClose={closeModal} />
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};
