// react-app/src/errorConfig.jsx
import ErrorPage from './pages/ErrorPage';

// Array of error objects (all text in Arabic)
const errors = [
  {
    code: 429,
    path: '/error/rate-limit',
    description: 'لقد قمت بطلبات كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا.',
    image: '/icon.svg',
    button: {
      path: '/help',
      text: 'صفحة المساعدة',
    },
  },
  {
    code: 401,
    description: 'أنت غير مصرح لك بالوصول إلى هذه الصفحة. يرجى تسجيل الدخول.',
    image: '/icon.svg',
    button: {
      path: '/login',
      text: 'صفحة تسجيل الدخول',
    },
  },
  {
    code: 404,
    description: 'الصفحة التي تبحث عنها غير موجودة.',
    image: '/icon.svg',
    button: {
      path: '/help',
      text: 'صفحة المساعدة',
    },
  },
  {
    code: 500,
    description: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.',
    image: '/icon.svg',
    button: {
      path: '/help',
      text: 'صفحة المساعدة',
    },
  },
  {
    code: 400,
    description:
      'بيانات غير صالحة. يرجى التحقق من البيانات والمحاولة مرة أخرى.',
    image: '/icon.svg',
    button: {
      path: '/help',
      text: 'صفحة المساعدة',
    },
  },
];

// Function to generate error pages dynamically
const generateErrorPages = () => {
  return errors.map((error) => ({
    path: error.path,
    element: <ErrorPage error={error} />, // Render the error page dynamically
  }));
};

// Export the array for /utils/api.js
export const errorRedirects = errors.map((error) => ({
  code: error.code,
  path: error.path,
}));

// Export the array of routes for main.jsx
export const errorRoutes = generateErrorPages();

export default errors;
