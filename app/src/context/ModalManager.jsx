// react-app/src/context/ModalManager.jsx
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ModalContext } from './modal-context';
import ProfileModal from '../components/explore/widgets/ProfileModal';
import ProductModal from '../components/explore/widgets/ProductModal';

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const openModal = (modalName, props) => setModal({ name: modalName, props });
  const closeModal = useCallback((shouldBack = true) => {
    if (shouldBack) window.history.back();
    setModal(null);
  }, []);

  // Handle browser back button
  useEffect(() => {
    if (modal) window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (modal) closeModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modal, closeModal]);

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
