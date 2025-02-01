import React from 'react';
import PropTypes from 'prop-types';

const Dialog = ({ children, ...props }) => (
  <div
    role="dialog"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    {...props}
    style={{
      marginTop: '-calc(1.5rem * calc(1 - var(--tw-space-y-reverse)))',
    }}>
    <div className="fixed inset-0" aria-hidden="true" />
    {children}
  </div>
);

Dialog.propTypes = {
  children: PropTypes.node.isRequired,
};

const DialogContent = ({ children, className, ...props }) => (
  <div
    className={`relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-8 text-gray-800 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${className}`}
    {...props}>
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
      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
      {...props}>
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
