// react-app/src/pages/ErrorPage.jsx
import PropTypes from 'prop-types';
import { Button } from '../components/ui/button'; // Ensure this import path is correct

const ErrorPage = ({ error }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center p-6"
      style={{
        background: 'var(--background)',
      }}>
      {/* Page Title with Hover Animation */}
      <h1
        className="text-4xl font-bold mb-4 text-primary hover:text-accent transition-all duration-500 hover:scale-105"
        style={{ textShadow: '0 0 5px var(--primary)' }}>
        {error.code} - خطأ
      </h1>

      {/* Error Image with Hover Animation */}
      <img
        src={error.image}
        alt={`Error ${error.code}`}
        className="w-48 h-auto mb-6 hover:scale-110 transition-transform duration-500"
      />

      {/* Error Description with Hover Animation */}
      <p
        className="text-lg mb-6 text-muted-foreground hover:text-foreground transition-all duration-500 hover:scale-105"
        style={{ textShadow: '0 0 5px var(--muted-foreground)' }}>
        {error.description}
      </p>

      {/* Button with Neon Hover Animation */}
      <Button
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-all duration-500"
        style={{
          boxShadow:
            '0 0 10px var(--primary), 0 0 20px var(--primary), 0 0 40px var(--primary)',
        }}
        onClick={() => (window.location.pathname = error.button.path)}>
        الانتقال إلى {error.button.text}
      </Button>
    </div>
  );
};

// PropTypes for the ErrorPage component
ErrorPage.propTypes = {
  error: PropTypes.shape({
    code: PropTypes.number.isRequired,
    path: PropTypes.string,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    button: PropTypes.shape({
      text: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ErrorPage;
