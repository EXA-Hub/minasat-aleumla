// my-react-app/src/components/explore/widgets/ProductModal.jsx
import { useModal } from '../../../context/ModalManager';
import ProductPage from '../../../pages/autoRouting/:username/product/:productId';

const ProductModal = ({ username, productId }) => {
  const { closeModal } = useModal();

  return (
    <div
      onClick={() => closeModal()}
      className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating to the backdrop
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-t-2xl shadow-lg transition-transform duration-200"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
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
