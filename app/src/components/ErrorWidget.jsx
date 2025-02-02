import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const ErrorWidget = ({ error, onClose, response }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible && isClosing) return null;

  const { error: err, details } = response || {};

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}>
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isVisible && !isClosing
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-lg bg-background shadow-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute left-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X size={20} />
            <span className="sr-only">إغلاق</span>
          </button>

          {/* Content */}
          <div className="px-6 pb-6 pt-12">
            <div className="text-center">
              {/* Error Icon/Image */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100/10">
                {error.image ? (
                  <img
                    src={error.image || '/placeholder.svg'}
                    alt=""
                    className="h-10 w-10"
                  />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>

              {/* Error Title */}
              <h2 className="mb-2 text-xl font-semibold">
                {error.code ? `خطأ ${error.code}` : 'خطأ'}
              </h2>

              {/* Error Description */}
              {error.description && (
                <p className="mb-6 text-muted-foreground">
                  {error.description}
                </p>
              )}

              {/* API Error Details */}
              {response && (
                <div className="space-y-3 rounded-md bg-red-50/10 p-4 text-right">
                  {/* Main error message */}
                  {err && (
                    <p
                      className="text-sm font-medium text-red-800"
                      role="alert">
                      {err}
                    </p>
                  )}

                  {/* Error details list */}
                  {details && details.length > 0 && (
                    <ul className="space-y-2 text-sm text-red-700" role="alert">
                      {details.map((detail, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-end gap-1">
                          <span>{detail.message}</span>
                          {detail.field && (
                            <span className="font-medium">{detail.field}:</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-muted/50 border-t px-6 py-4">
            <button
              onClick={handleClose}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-90primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              حسناً، فهمت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorWidget.propTypes = {
  error: PropTypes.shape({
    code: PropTypes.number,
    image: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func,
  response: PropTypes.shape({
    error: PropTypes.string,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string,
        message: PropTypes.string,
      })
    ),
  }),
};

export default ErrorWidget;
