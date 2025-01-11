// react-app/src/components/ErrorWidget.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const ErrorWidget = ({ error, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match the duration of the fade-out animation
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`relative w-full max-w-md bg-background p-6 rounded-lg shadow-lg m-4 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error.code} - خطأ</h2>
          <img
            src={error.image}
            alt="Error"
            className="w-24 h-24 mx-auto mb-4"
          />
          <p className="text-muted-foreground mb-6">{error.description}</p>
        </div>
      </div>
    </div>
  );
};

ErrorWidget.propTypes = {
  error: PropTypes.shape({
    code: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

export default ErrorWidget;
