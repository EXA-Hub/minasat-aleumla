// react-app/src/context/ModalManager.jsx
import { createContext, useContext, useState } from 'react';
import ProfileModal from '../components/explore/widgets/ProfileModal';
import ProductModal from '../components/explore/widgets/ProductModal';
import PropTypes from 'prop-types';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const openModal = (modalName, props) => setModal({ name: modalName, props });
  const closeModal = () => setModal(null);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );

  function renderModal() {
    if (!modal) return null;

    const { name, props } = modal;
    switch (name) {
      case 'profile':
        return <ProfileModal {...props} onClose={closeModal} />;
      case 'product':
        return <ProductModal {...props} onClose={closeModal} />;
      default:
        return null;
    }
  }
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useModal = () => useContext(ModalContext);
