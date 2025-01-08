import React from 'react';
import PropTypes from 'prop-types';

const Dialog = ({ children, ...props }) => (
  <div
    role="dialog"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    {...props}
    style={{
      marginTop: '-calc(1.5rem * calc(1 - var(--tw-space-y-reverse)))',
    }}
  >
    <div className="fixed inset-0" aria-hidden="true" />
    {children}
  </div>
);

Dialog.propTypes = {
  children: PropTypes.node.isRequired,
};

const DialogContent = ({ children, className, ...props }) => (
  <div
    className={`relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-xl p-8 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-700 ${className}`}
    {...props}
  >
    {children}
  </div>
);

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const DialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-right ${className}`}
    {...props}
  />
);

DialogHeader.propTypes = {
  className: PropTypes.string,
};

const DialogTitle = ({ className, ...props }) => (
  <h3
    className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${className}`}
    {...props}
  />
);

DialogTitle.propTypes = {
  className: PropTypes.string,
};

const DialogTrigger = ({ asChild = false, children, ...props }) => {
  const Comp = asChild ? (
    React.cloneElement(children, props)
  ) : (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
      {...props}
    >
      {children}
    </button>
  );
  return Comp;
};

DialogTrigger.propTypes = {
  asChild: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
