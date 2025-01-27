import PropTypes from 'prop-types';

function LoadingPage({ text = 'جاري تحميل الصفحة' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Loader Container */}
      <div className="flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-primary border-muted"></div>

        {/* Bouncing Dots */}
        <div className="flex gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
        </div>

        {/* Loading Text */}
        <div className="animate-pulse text-xl font-semibold text-muted-foreground">
          {text}
        </div>
      </div>
    </div>
  );
}

LoadingPage.propTypes = {
  text: PropTypes.string,
};

export default LoadingPage;
