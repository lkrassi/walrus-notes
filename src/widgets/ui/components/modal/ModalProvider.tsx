import {
  createContext,
  lazy,
  Suspense,
  useContext,
  type FC,
  type ReactNode,
} from 'react';
import {
  useModal,
  type ModalOptions,
  type ModalState,
} from 'widgets/hooks/useModal';
const Modal = lazy(() => import('./Modal').then(m => ({ default: m.Modal })));

interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  updateModalContent: (content: ReactNode) => void;
  modalState: ModalState;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

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
      <Suspense fallback={null}>
        <Modal modalState={modalState} onClose={closeModal} />
      </Suspense>
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
