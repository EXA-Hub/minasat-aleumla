import { Component } from 'react';
import PropTypes from 'prop-types';

const ErrorBoundaryPage = ({ error, componentStack, onReset }) => {
  return (
    <div className="m-5 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/10">
      <h2 className="mb-2 text-xl font-bold text-red-700">
        حدث خطأ في التطبيق
      </h2>
      <div className="space-y-2">
        <p className="text-red-600">{error?.message || 'حدث خطأ ما'}</p>

        {/* Show error details in development */}
        {import.meta.env.DEV && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-foreground">
              تفاصيل الخطأ
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded bg-red-500/50 p-4 text-sm text-foreground">
              {error?.stack}
              {componentStack && (
                <>
                  <br />
                  <br />
                  Component Stack:
                  <br />
                  {componentStack}
                </>
              )}
            </pre>
          </details>
        )}
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={onReset || (() => window.location.reload())}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          اعادة التحميل
        </button>
        <button
          onClick={() => window.history.back()}
          className="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-500/10">
          رجوع
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      componentStack: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      componentStack: errorInfo.componentStack,
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.setState({
        error: event.reason,
        componentStack: null,
      });
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      error: null,
      componentStack: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <ErrorBoundaryPage
            error={this.state.error}
            componentStack={this.state.componentStack}
            onReset={this.resetErrorBoundary}
          />
        )
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.element,
  onReset: PropTypes.func,
};

ErrorBoundaryPage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string,
  }),
  componentStack: PropTypes.string,
  onReset: PropTypes.func,
};

export { ErrorBoundary as default, ErrorBoundaryPage };
