import { ModalContext, useModal } from '@/shared/lib/react';
import { type FC, type ReactNode } from 'react';
import { Modal } from './Modal';

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
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
