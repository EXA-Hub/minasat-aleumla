// my-react-app/src/components/explore/widgets/ProductModal.jsx
import { useModal } from '../../../context/ModalManager';
import ProductPage from '../../../pages/core/:username/product/:productId';

const ProductModal = ({ username, productId }) => {
  const { closeModal } = useModal();

  return (
    <div
      onClick={() => closeModal()}
      className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200">
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating to the backdrop
        className="scrollbar-hide fixed bottom-0 left-1/2 -translate-x-1/2 transform rounded-t-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg transition-transform duration-200 dark:from-gray-900 dark:to-gray-800"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Hide scrollbar for Firefox
          msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
        }}>
        <ProductPage
          username={username}
          productid={productId}
          closeWidget={closeModal}
        />
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';
ProductModal.propTypes = {
  username: PropTypes.string.isRequired,
  productId: PropTypes.string.isRequired,
  navigate: PropTypes.func,
};

export default ProductModal;
