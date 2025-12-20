import { createContext, useContext } from 'react';

export const ModalContentContext = createContext<{ closeModal: () => void }>({
  closeModal: () => {},
});

export const useModalContentContext = () => useContext(ModalContentContext);
