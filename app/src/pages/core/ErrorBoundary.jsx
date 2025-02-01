// app/src/pages/core/ErrorBoundary.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ErrorBoundary = ({ children, fallback }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught:', error);
      setError(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (error)
    return (
      fallback || (
        <div className="m-5 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/10">
          <h2 className="mb-2 text-xl font-bold text-red-700">
            حدث خطأ في التطبيق
          </h2>
          {import.meta.env.DEV && (
            <p className="text-red-600">{error.message}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            اعادة التحميل
          </button>
        </div>
      )
    );

  return children;
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.element,
};

export default ErrorBoundary;
