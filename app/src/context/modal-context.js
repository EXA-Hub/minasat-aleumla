// react-app/src/context/modal-context.js
import { createContext, useContext } from 'react';

export const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);
