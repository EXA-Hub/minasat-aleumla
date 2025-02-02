import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
      dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Error Number with Gradient */}
        <div className="relative">
          <h1 className="text-[150px] font-black text-10primary">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-primary">
              الصفحة غير موجودة
            </h2>
          </div>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-20primary">
            <svg
              className="h-12 w-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
          </p>

          {/* Action Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex transform items-center rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-90primary hover:shadow-xl">
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
